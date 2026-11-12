import { z } from "zod";

export const pricingSettingsSchema = z.object({
  bookSaleDiscountPercentage: z.coerce.number().min(0).max(100),
  customBundleDiscountPercentage: z.coerce.number().min(0).max(100),
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
