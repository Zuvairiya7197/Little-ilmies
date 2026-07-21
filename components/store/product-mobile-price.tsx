"use client";

import { Download, Printer, Baby, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { useProductPrice } from "@/hooks/use-product-price";
import type { ProductDetail } from "@/types/catalog";

const trustPoints = [
  { label: "Instant Download", icon: Download, iconColor: "text-ink-500" },
  { label: "Printable at Home", icon: Printer, iconColor: "text-sage-600" },
  { label: "Kid Friendly", icon: Baby, iconColor: "text-teal-600" },
  { label: "Secure Checkout", icon: ShieldCheck, iconColor: "text-sunny-600" },
] as const;

export function ProductMobilePrice({ product }: { product: ProductDetail }) {
  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;
  const discountPercent = resolvedPrice.salePrice
    ? Math.round((1 - resolvedPrice.salePrice / resolvedPrice.regularPrice) * 100)
    : 0;

  return (
    <div className="mt-6 md:hidden">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl font-semibold text-ink-700">
          {formatPrice(displayPrice, resolvedPrice.currencyCode)}
        </span>
        {resolvedPrice.salePrice && (
          <>
            <span className="text-base text-ink-300 line-through">
              {formatPrice(resolvedPrice.regularPrice, resolvedPrice.currencyCode)}
            </span>
            {discountPercent > 0 && (
              <span className="rounded-full bg-blossom-50 px-2.5 py-1 text-xs font-bold text-blossom-600">
                {discountPercent}% OFF
              </span>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {trustPoints.map(({ label, icon: Icon, iconColor }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-2xl bg-cream-50 px-4 py-3 text-sm font-semibold text-ink-600 shadow-clay-sm"
          >
            <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
