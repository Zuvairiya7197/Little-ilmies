"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
import type { BundleSummary } from "@/types/catalog";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function CustomBundleBuilder({ bundle }: { bundle: BundleSummary }) {
  const currency = useCurrencyStore((state) => state.currency);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const editId = useSearchParams().get("edit");
  const editingItem = items.find((item) => (item.cartItemId ?? item.productId) === editId);

  const enabledSizes = useMemo(() => {
    const byQuantity = new Map<number, NonNullable<BundleSummary["customPrices"]>>();
    for (const price of bundle.customPrices ?? []) {
      if (!price.enabled) continue;
      byQuantity.set(price.quantity, [...(byQuantity.get(price.quantity) ?? []), price]);
    }
    return Array.from(byQuantity.entries())
      .map(([quantity, prices]) => ({
        quantity,
        price: prices.find((price) => price.currencyCode === currency),
      }))
      .filter((size): size is { quantity: number; price: NonNullable<typeof size.price> } => Boolean(size.price))
      .sort((a, b) => a.quantity - b.quantity);
  }, [bundle.customPrices, currency]);

  const [selectedQuantity, setSelectedQuantity] = useState(
    editingItem?.bundleSize && enabledSizes.some((size) => size.quantity === editingItem.bundleSize)
      ? editingItem.bundleSize
      : enabledSizes[0]?.quantity
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(editingItem?.selectedProductIds ?? []);
  const selectedSize = enabledSizes.find((size) => size.quantity === selectedQuantity);
  const isComplete = Boolean(selectedQuantity && selectedIds.length === selectedQuantity);
  const heroBooks = bundle.products.slice(0, 8);

  function toggleBook(productId: string) {
    setSelectedIds((current) => {
      if (current.includes(productId)) return current.filter((id) => id !== productId);
      if (!selectedQuantity || current.length >= selectedQuantity) return current;
      return [...current, productId];
    });
  }

  function addBundleToCart() {
    if (!selectedSize || !isComplete) return;
    const selectedBooks = selectedIds
      .map((id) => bundle.products.find((product) => product.id === id))
      .filter(Boolean)
      .map((product) => ({
        id: product!.id,
        slug: product!.slug,
        title: product!.title,
        coverImage: product!.coverImage,
      }));

    addItem({
      cartItemId: editId ?? `custom-${bundle.id}-${crypto.randomUUID()}`,
      type: "CUSTOM_BUNDLE",
      productId: `bundle:${bundle.id}`,
      bundleId: bundle.id,
      slug: bundle.slug,
      title: bundle.name,
      coverImage: bundle.coverImage ?? selectedBooks[0]?.coverImage ?? "/images/explore-bundles.png",
      bundleSize: selectedSize.quantity,
      selectedProductIds: selectedIds,
      selectedBooks,
      bundlePrices: bundle.customPrices,
    });
    router.push("/cart");
  }

  return (
    <div className="container-content py-6 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-lilac-50 to-blossom-50 shadow-clay-sm">
            {heroBooks.length > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-8">
                <div className="relative h-full w-full max-w-[34rem]">
                  {heroBooks.map((book, index) => {
                    const positions = [
                      "left-[7%] top-[18%] rotate-[-12deg]",
                      "left-[20%] top-[10%] rotate-[-5deg]",
                      "left-[34%] top-[15%] rotate-[4deg]",
                      "left-[48%] top-[9%] rotate-[10deg]",
                      "left-[62%] top-[19%] rotate-[15deg]",
                      "left-[17%] top-[43%] rotate-[8deg]",
                      "left-[38%] top-[39%] rotate-[-7deg]",
                      "left-[58%] top-[45%] rotate-[5deg]",
                    ];
                    return (
                      <div
                        key={book.id}
                        className={cn(
                          "absolute h-[42%] w-[24%] overflow-hidden rounded-xl bg-white shadow-[0_16px_40px_rgba(75,31,124,0.16)] ring-1 ring-white/80",
                          positions[index] ?? ""
                        )}
                      >
                        <Image
                          src={book.coverImage}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 120px, 25vw"
                          className="object-contain p-1.5"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Image
                src={bundle.coverImage ?? "/images/explore-bundles.png"}
                alt=""
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-contain p-6"
              />
            )}
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold text-ink-900">{bundle.name}</h1>
          {bundle.description && <p className="mt-2 text-base leading-7 text-ink-500">{bundle.description}</p>}
        </div>

        <div className="rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
          <h2 className="font-display text-xl font-bold text-ink-800">Choose your bundle</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {enabledSizes.map((size) => (
              <button
                key={size.quantity}
                type="button"
                onClick={() => {
                  setSelectedQuantity(size.quantity);
                  setSelectedIds((current) => current.slice(0, size.quantity));
                }}
                className={cn(
                  "rounded-2xl border-2 bg-white px-4 py-3 text-left transition",
                  selectedQuantity === size.quantity ? "border-violet-700" : "border-lilac-100 hover:border-lilac-300"
                )}
              >
                <span className="block font-display text-lg font-bold text-ink-900">{size.quantity} Books</span>
                <span className="mt-1 block text-sm font-semibold text-violet-800">
                  {formatPrice(size.price.price, size.price.currencyCode)}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink-800">Select books</h2>
            <p aria-live="polite" className="rounded-full bg-lilac-100 px-3 py-1 text-sm font-bold text-violet-800">
              Selected: {selectedIds.length} / {selectedQuantity ?? 0}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {bundle.products.map((product) => {
              const selected = selectedIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleBook(product.id)}
                  aria-pressed={selected}
                  className={cn(
                    "grid grid-cols-[64px_minmax(0,1fr)_28px] items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left transition",
                    selected ? "border-violet-700" : "border-lilac-100 hover:border-lilac-300"
                  )}
                >
                  <span className="relative h-20 overflow-hidden rounded-xl bg-cream-100">
                    <Image src={product.coverImage} alt="" fill sizes="64px" className="object-contain p-1" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-bold leading-tight text-ink-800">{product.title}</span>
                    <span className="mt-1 block text-xs text-ink-400">{product.pageCount} pages</span>
                  </span>
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full border",
                      selected ? "border-violet-700 bg-violet-700 text-white" : "border-lilac-200 text-transparent"
                    )}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addBundleToCart}
            disabled={!isComplete}
            className="btn-primary mt-6 w-full justify-center disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Add Bundle to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
