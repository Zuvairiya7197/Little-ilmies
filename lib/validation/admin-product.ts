import { z } from "zod";

const regionalPriceSchema = z.object({
  currencyCode: z.enum(["INR", "USD", "GBP", "AED"]),
  regularPrice: z.coerce.number().min(0, "Must be 0 or more"),
  salePrice: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  isActive: z.boolean().default(true),
});

export const productFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().min(10, "Description is required"),
  shortDescription: z.string().trim().min(5, "Short description is required"),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  ageRange: z.enum(["0-3", "3-6", "6-9", "9-12", "12+"]),
  language: z.enum(["English", "Arabic", "Urdu", "Hindi", "Marathi"]),
  format: z.enum(["PDF", "Printable PDF", "Interactive PDF"]),
  pageCount: z.coerce.number().int().min(1, "Must be at least 1 page"),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  hasFreePreview: z.boolean().default(true),
  isHomepageSample: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  prices: z.array(regionalPriceSchema).min(1, "Add at least an INR price"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
