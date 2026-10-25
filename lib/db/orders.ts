import { prisma } from "@/lib/db/prisma";
import type { CurrencyCode } from "@/types/pricing";
import type { OrderRecord, DownloadRecord, OrderSummaryItem, RentalRecord } from "@/types/account";
import { parseCustomBundleSnapshot } from "@/lib/bundles/order-snapshot";
import { productCoverUrl } from "@/lib/catalog-assets";
import { downloadHref, formatName, isPdfFormat, type PdfFormat } from "@/lib/formats";

/**
 * Purchase history and downloads must only ever be looked up by verified
 * session identity (userId from a logged-in Auth.js session) — never by an
 * email string typed into a form. See README "Regional pricing" /
 * checkout contract for the same principle applied to pricing: never trust
 * unverified client input for anything that gates access to purchased
 * content.
 */
/**
 * Moves guest orders (placed while logged out) under the account that owns
 * their email, so the buyer's downloads and rentals show up there. Only
 * call once that email is proven to belong to this user — a magic-link
 * sign-in, or a user whose emailVerified is set.
 */
export async function linkGuestOrdersToUser(userId: string, email: string) {
  return prisma.order.updateMany({
    where: { userId: null, buyerEmail: { equals: email.trim(), mode: "insensitive" } },
    data: { userId },
  });
}

export async function getOrdersForUser(userId: string): Promise<OrderRecord[]> {
  const orders = await prisma.order.findMany({
    where: { userId, status: "PAID" },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
      rentals: true,
    },
  });

  const now = new Date();

  return orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    currencyCode: order.currencyCode as CurrencyCode,
    totalAmount: order.totalAmount,
    status: order.status,
    items: order.items.flatMap((item): OrderSummaryItem[] => {
      if (item.itemType === "CUSTOM_BUNDLE") {
        const snapshot = parseCustomBundleSnapshot(item.bundleSnapshot);
        if (!snapshot) return [];
        return [{
          type: "CUSTOM_BUNDLE" as const,
          bundleId: snapshot.bundleId,
          slug: "",
          title: `${snapshot.bundleName} (${snapshot.quantity} books)`,
          // Snapshots store the raw storage key, so resolve it like any
          // other product cover (the route looks the cover up by id).
          coverImage: snapshot.selectedBooks[0]?.coverImage
            ? productCoverUrl(snapshot.selectedBooks[0].id, snapshot.selectedBooks[0].coverImage)
            : "/images/explore-bundles.webp",
          unitPrice: item.unitPrice,
          selectedBooks: snapshot.selectedBooks.map((book) => ({ id: book.id, title: book.title })),
        }];
      }
      if (!item.product) return [];
      const isRental = item.itemType === "RENTAL";
      const rental = isRental
        ? order.rentals.find((r) => r.productId === item.productId)
        : undefined;
      return [{
        type: isRental ? ("RENTAL" as const) : ("PRODUCT" as const),
        productId: item.productId ?? undefined,
        slug: item.product.slug,
        title: item.product.title,
        coverImage: productCoverUrl(item.product.id, item.product.coverImage),
        unitPrice: item.unitPrice,
        formatName: formatName(isRental ? "RENT_AND_READ" : item.format),
        rentalExpiresAt: rental?.rentalExpiresAt.toISOString(),
        rentalIsActive: rental ? rental.rentalExpiresAt > now : undefined,
      }];
    }),
  }));
}

export async function getRentalsForUser(userId: string): Promise<RentalRecord[]> {
  const now = new Date();
  const rentals = await prisma.rentalAccess.findMany({
    where: { order: { userId, status: "PAID" } },
    orderBy: { rentalExpiresAt: "desc" },
    include: { product: true },
  });

  return rentals.map((rental) => ({
    orderId: rental.orderId,
    productId: rental.productId,
    slug: rental.product.slug,
    title: rental.product.title,
    coverImage: productCoverUrl(rental.product.id, rental.product.coverImage),
    startedAt: rental.rentalStartedAt.toISOString(),
    expiresAt: rental.rentalExpiresAt.toISOString(),
    isActive: rental.rentalExpiresAt > now,
  }));
}

/** A logged-in buyer's existing entitlement for one product — powers the
 * product page's "You already own this" / "You are currently renting
 * this" states so we don't re-sell what they already have. */
export async function getProductEntitlementForUser(userId: string, productId: string) {
  const [downloads, rental] = await Promise.all([
    prisma.download.findMany({
      where: { productId, order: { userId, status: "PAID" } },
      select: { format: true },
    }),
    prisma.rentalAccess.findFirst({
      where: { productId, rentalExpiresAt: { gt: new Date() }, order: { userId, status: "PAID" } },
      select: { rentalExpiresAt: true },
    }),
  ]);

  const ownedFormats = Array.from(
    new Set(downloads.map((d) => d.format).filter((format): format is PdfFormat => isPdfFormat(format)))
  );

  return {
    /** PDF formats this buyer already owns — each is downloadable on its own. */
    ownedFormats,
    activeRentalExpiresAt: rental?.rentalExpiresAt.toISOString() ?? null,
  };
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
    coverImage: productCoverUrl(download.product.id, download.product.coverImage),
    fileType: download.product.format as DownloadRecord["fileType"],
    format: isPdfFormat(download.format) ? download.format : "COLOUR_PDF",
    formatName: formatName(download.format),
    downloadHref: downloadHref(download.productId, isPdfFormat(download.format) ? download.format : "COLOUR_PDF"),
    purchasedAt: download.order.createdAt.toISOString(),
    downloadCount: download.downloadCount,
  }));
}
