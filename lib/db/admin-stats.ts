import { prisma } from "@/lib/db/prisma";

export async function getRevenueSummary() {
  const [paidOrders, totalBuyers, totalProducts, pendingOrders] = await Promise.all([
    prisma.order.findMany({ where: { status: "PAID" }, select: { totalAmount: true, currencyCode: true } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
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

export async function getMostDownloadedProducts(limit = 8) {
  return prisma.product.findMany({
    orderBy: { downloadCount: "desc" },
    take: limit,
    where: { downloadCount: { gt: 0 } },
  });
}
