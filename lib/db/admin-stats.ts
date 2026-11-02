import { prisma } from "@/lib/db/prisma";

export async function getRevenueSummary() {
  const [paidOrders, totalBuyers, totalProducts, pendingOrders] = await Promise.all([
    prisma.order.findMany({ where: { status: "PAID" }, select: { totalAmount: true, currencyCode: true } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.product.count({ where: { status: "PUBLISHED", archivedAt: null } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  const revenueByCurrency = paidOrders.reduce<Record<string, number>>((acc, order) => {
    acc[order.currencyCode] = (acc[order.currencyCode] ?? 0) + order.totalAmount;
    return acc;
  }, {});

  return {
    revenueByCurrency,
    totalOrders: paidOrders.length,
    totalBuyers,
    totalProducts,
    pendingOrders,
  };
}

export async function getRecentOrders(limit = 8) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { items: { include: { product: true } } },
  });
}

/**
 * Real downloads per book, from the per-purchase Download rows the download
 * route increments. Product.downloadCount is a storefront display number set
 * by hand/seed and never counts actual downloads, so reports must not use it.
 */
export async function getDownloadReport() {
  const grouped = await prisma.download.groupBy({
    by: ["productId"],
    _sum: { downloadCount: true },
    _count: { _all: true },
    _max: { lastDownloadedAt: true },
  });

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, title: true, coverImage: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  return grouped
    .flatMap((g) => {
      const product = productById.get(g.productId);
      if (!product) return [];
      return [
        {
          ...product,
          downloadCount: g._sum.downloadCount ?? 0,
          /** Purchases (one per order and format) that unlocked this book. */
          purchaseCount: g._count._all,
          lastDownloadedAt: g._max.lastDownloadedAt,
        },
      ];
    })
    .sort((a, b) => b.downloadCount - a.downloadCount || b.purchaseCount - a.purchaseCount);
}

export async function getMostDownloadedProducts(limit = 8) {
  const report = await getDownloadReport();
  return report.filter((p) => p.downloadCount > 0).slice(0, limit);
}

/** Latest download activity, for the downloads report. */
export async function getRecentDownloads(limit = 20) {
  return prisma.download.findMany({
    where: { lastDownloadedAt: { not: null } },
    orderBy: { lastDownloadedAt: "desc" },
    take: limit,
    include: {
      product: { select: { title: true } },
      order: { select: { buyerEmail: true } },
    },
  });
}
