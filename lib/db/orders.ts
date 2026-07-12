import { prisma } from "@/lib/db/prisma";
import type { CurrencyCode } from "@/types/pricing";
import type { OrderRecord, DownloadRecord } from "@/types/account";

/**
 * Purchase history and downloads must only ever be looked up by verified
 * session identity (userId from a logged-in Auth.js session) — never by an
 * email string typed into a form. See README "Regional pricing" /
 * checkout contract for the same principle applied to pricing: never trust
 * unverified client input for anything that gates access to purchased
 * content.
 */
export async function getOrdersForUser(userId: string): Promise<OrderRecord[]> {
  const orders = await prisma.order.findMany({
    where: { userId, status: "PAID" },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    currencyCode: order.currencyCode as CurrencyCode,
    totalAmount: order.totalAmount,
    status: order.status,
    items: order.items.map((item) => ({
      productId: item.productId,
      slug: item.product.slug,
      title: item.product.title,
      coverImage: item.product.coverImage,
      unitPrice: item.unitPrice,
    })),
  }));
}

export async function getDownloadsForUser(userId: string): Promise<DownloadRecord[]> {
  const downloads = await prisma.download.findMany({
    where: { order: { userId, status: "PAID" } },
    orderBy: { createdAt: "desc" },
    include: { product: true, order: true },
  });

  return downloads.map((download) => ({
    orderId: download.orderId,
    productId: download.productId,
    slug: download.product.slug,
    title: download.product.title,
    coverImage: download.product.coverImage,
    fileType: download.product.format as DownloadRecord["fileType"],
    purchasedAt: download.order.createdAt.toISOString(),
    downloadCount: download.downloadCount,
  }));
}
