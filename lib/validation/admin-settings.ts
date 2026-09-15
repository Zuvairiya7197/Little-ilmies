import { z } from "zod";

export const pricingSettingsSchema = z.object({
  bookSaleDiscountPercentage: z.coerce.number().min(0).max(100),
  customBundleDiscountPercentage: z.coerce.number().min(0).max(100),
});

export type PricingSettingsFormValues = z.infer<typeof pricingSettingsSchema>;
