import { z } from "zod";

const saleDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date");

export const saleWindowSchema = z
  .object({
    name: z.string().trim().min(2, "Name the sale").max(40, "Keep the name under 40 characters"),
    start: saleDateSchema,
    end: saleDateSchema,
    discountPercentage: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      z.coerce.number().min(1).max(90).nullable()
    ),
  })
  .refine((w) => w.start <= w.end, { path: ["end"], message: "The sale must end on or after its start date" });

export const pricingSettingsSchema = z
  .object({
    bookSaleDiscountPercentage: z.coerce.number().min(0).max(100),
    customBundleDiscountPercentage: z.coerce.number().min(0).max(100),
    bookSaleMode: z.enum(["ALWAYS", "SCHEDULED", "OFF"]).default("ALWAYS"),
    saleWindows: z.array(saleWindowSchema).max(30).default([]),
  })
  .superRefine((value, ctx) => {
    const sorted = [...value.saleWindows].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start <= sorted[i - 1].end) {
        ctx.addIssue({
          code: "custom",
          path: ["saleWindows"],
          message: `“${sorted[i - 1].name}” and “${sorted[i].name}” overlap`,
        });
      }
    }
  });

export type PricingSettingsFormValues = z.infer<typeof pricingSettingsSchema>;

export const storefrontSettingsSchema = z.object({
  hardcoverComingSoonEnabled: z.boolean(),
});

export const reviewRewardSettingsSchema = z.object({
  rewardPercentage: z.coerce.number().int().min(0).max(90),
  firstReviewRewardPercentage: z.coerce.number().int().min(0).max(90),
  rewardValidDays: z.coerce.number().int().min(1).max(365),
});

/** Amounts in major units (rupees, dollars…) as typed in the admin form. */
export const couponMinimumsSchema = z.object({
  INR: z.coerce.number().min(0).max(100000),
  USD: z.coerce.number().min(0).max(10000),
  GBP: z.coerce.number().min(0).max(10000),
  AED: z.coerce.number().min(0).max(50000),
});
