import { z } from "zod";

const regionalPriceSchema = z.object({
  currencyCode: z.enum(["INR", "USD", "GBP", "AED"]),
  regularPrice: z.coerce.number().min(0, "Must be 0 or more"),
  salePrice: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  saleStartDate: z.string().optional().or(z.literal("").transform(() => undefined)),
  saleEndDate: z.string().optional().or(z.literal("").transform(() => undefined)),
  isActive: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (value.salePrice != null && value.salePrice > value.regularPrice) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["salePrice"], message: "Sale price cannot exceed regular price" });
  }
  if (value.saleStartDate && value.saleEndDate && new Date(value.saleStartDate) > new Date(value.saleEndDate)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["saleEndDate"], message: "Sale end date must be after start date" });
  }
});

const stringListSchema = z
  .array(z.string().trim().min(1, "Remove empty items"))
  .default([]);

export const productFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  author: z.string().trim().optional(),
  sku: z
    .string()
    .trim()
    .max(40, "Keep SKU under 40 characters")
    .transform((value) => (value === "" ? undefined : value.toUpperCase()))
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().min(10, "Description is required"),
  shortDescription: z.string().trim().min(5, "Short description is required"),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  tags: stringListSchema,
  ageRange: z.enum(["0-3", "3-6", "6-9", "9-12", "12+"]),
  language: z.enum(["English", "Arabic", "Hindi", "Marathi"]),
  format: z.enum(["PDF", "Printable PDF", "Interactive PDF"]),
  pageCount: z.coerce.number().int().min(1, "Must be at least 1 page"),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
  hasFreePreview: z.boolean().default(true),
  isHomepageSample: z.boolean().default(false),
  whatsIncluded: stringListSchema,
  learningObjectives: stringListSchema,
  suitableFor: stringListSchema,
  usageLicense: z.enum(["PERSONAL_USE", "PERSONAL_CLASSROOM", "COMMERCIAL_USE"]).default("PERSONAL_USE"),
  licenseInfo: z.string().trim().optional(),
  baseCurrency: z.enum(["INR", "USD", "GBP", "AED"]).default("INR"),
  productVersion: z.string().trim().max(20, "Keep version concise").optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().trim().max(70, "Keep SEO titles close to 60 characters").optional(),
  seoDescription: z.string().trim().max(180, "Keep meta descriptions close to 160 characters").optional(),
  seoKeywords: stringListSchema,
  prices: z.array(regionalPriceSchema).min(1, "Add at least an INR price"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
