import { z } from "zod";
import { CURRENCIES } from "@/types/pricing";

const supportedCurrencies = Object.keys(CURRENCIES) as [string, ...string[]];

export const bundleSizePriceSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  enabled: z.coerce.boolean(),
  prices: z.record(z.enum(supportedCurrencies), z.coerce.number().min(0, "Prices cannot be negative").optional()),
});

export const bundleFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().optional(),
  type: z.enum(["FIXED", "CUSTOM"]).default("FIXED"),
  isActive: z.coerce.boolean().default(true),
  bundlePriceInr: z.coerce.number().min(0).optional(),
  bundlePriceUsd: z.coerce.number().min(0).optional(),
  productIds: z.array(z.string()).min(2, "Select at least 2 products"),
  sizePrices: z.array(bundleSizePriceSchema).default([]),
}).superRefine((value, ctx) => {
  if (value.type === "FIXED") return;

  if (value.productIds.length < 1) {
    ctx.addIssue({ code: "custom", path: ["productIds"], message: "Select at least one eligible book" });
  }

  const seen = new Set<number>();
  for (const [index, size] of value.sizePrices.entries()) {
    if (seen.has(size.quantity)) {
      ctx.addIssue({ code: "custom", path: ["sizePrices", index, "quantity"], message: "Duplicate quantity" });
    }
    seen.add(size.quantity);

    if (!size.enabled) continue;
    if (size.quantity > value.productIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["sizePrices", index, "quantity"],
        message: "Enabled quantity cannot exceed eligible books",
      });
    }

    for (const currency of supportedCurrencies) {
      const price = size.prices[currency];
      if (price == null || Number.isNaN(price)) {
        ctx.addIssue({
          code: "custom",
          path: ["sizePrices", index, "prices", currency],
          message: `${currency} price is required`,
        });
      }
    }
  }

  if (!value.sizePrices.some((size) => size.enabled)) {
    ctx.addIssue({ code: "custom", path: ["sizePrices"], message: "Enable at least one bundle size" });
  }
});

export type BundleFormValues = z.infer<typeof bundleFormSchema>;
