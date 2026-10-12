import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/get-session";
import { getActiveRentalEntitlement } from "@/lib/rentals/entitlement";
import { getPublishedProductBySlug } from "@/lib/db/catalog";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { prisma } from "@/lib/db/prisma";
import { RENTAL_CURRENCY_CODE } from "@/lib/rentals/config";
import { RentalReader, type RentalUpgradeInfo } from "@/components/rentals/rental-reader";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export const metadata: Metadata = {
  title: "Rent & Read",
  robots: { index: false, follow: false },
};

export default async function RentalReaderPage({ params }: PageProps) {
  const { productId } = await params;
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const rental = await getActiveRentalEntitlement(session.user.id, productId);
  if (!rental) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-700 px-6 text-center">
        <h1 className="font-display text-2xl font-bold text-cream-50">Your rental has expired</h1>
        <p className="max-w-sm text-sm text-cream-100/80">
          This Rent &amp; Read access has ended. Buy this ebook to keep it permanently.
        </p>
        <Link href="/account/rentals" className="btn-primary mt-2">
          Back to My Rentals
        </Link>
      </main>
    );
  }

  const pageCount = rental.product.rentalPageImagePaths.length;
  if (pageCount === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-700 px-6 text-center">
        <h1 className="font-display text-2xl font-bold text-cream-50">We&apos;re still preparing this book</h1>
        <p className="max-w-sm text-sm text-cream-100/80">
          Your rental for &quot;{rental.product.title}&quot; is active, but the online reader isn&apos;t ready
          yet. This won&apos;t affect your rental period — please check back shortly, or contact support if
          this doesn&apos;t resolve soon.
        </p>
        <Link href="/account/rentals" className="btn-primary mt-2">
          Back to My Rentals
        </Link>
        <Link href="/contact" className="text-sm font-semibold text-cream-100/80 underline">
          Contact support
        </Link>
      </main>
    );
  }

  // Order ID alone is enough to trace a leaked page back to the rental it
  // came from — the customer's email doesn't need to be embedded in every
  // page image just for that, and showing it was needlessly identifying.
  const watermarkLabel = `Little Ilmies • Order #${rental.orderId.slice(-8).toUpperCase()}`;

  // Same upgrade-credit calculation as create-order: the price of the
  // book's primary PDF minus what this rental actually cost. Display-only —
  // /checkout re-derives the real charge itself from the paid rental order.
  const product = await getPublishedProductBySlug(rental.product.slug);
  const upgradeVariant = product?.variants.find((variant) => variant.format !== "RENT_AND_READ");
  const rentalOrderItem = await prisma.orderItem.findFirst({
    where: { orderId: rental.orderId, productId, itemType: "RENTAL" },
    select: { unitPrice: true },
  });
  let upgrade: RentalUpgradeInfo | null = null;
  if (product && upgradeVariant && upgradeVariant.format !== "RENT_AND_READ" && rentalOrderItem) {
    const resolvedPrice = resolveProductPrice(upgradeVariant, RENTAL_CURRENCY_CODE);
    const rentalPricePaid = rentalOrderItem.unitPrice;
    upgrade = {
      price: Math.max(0, (resolvedPrice.salePrice ?? resolvedPrice.regularPrice) - rentalPricePaid),
      rentalPricePaid,
      format: upgradeVariant.format,
      productSlug: product.slug,
      coverImage: product.coverImage,
      prices: upgradeVariant.prices,
      pageCount: product.pageCount,
      isBestseller: product.isBestseller,
      isNewArrival: product.isNewArrival,
    };
  }

  return (
    <RentalReader
      productId={productId}
      title={rental.product.title}
      pageCount={pageCount}
      expiresAt={rental.rentalExpiresAt.toISOString()}
      watermarkLabel={watermarkLabel}
      upgrade={upgrade}
    />
  );
}
