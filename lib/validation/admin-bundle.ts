import { z } from "zod";

export const bundleFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().optional(),
  bundlePriceInr: z.coerce.number().int().min(0).optional(),
  bundlePriceUsd: z.coerce.number().int().min(0).optional(),
  productIds: z.array(z.string()).min(2, "Select at least 2 products"),
});

export type BundleFormValues = z.infer<typeof bundleFormSchema>;
