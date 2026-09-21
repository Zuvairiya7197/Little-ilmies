import { z } from "zod";
import { FEATURED_CATEGORY_ACCENT_KEYS, FEATURED_CATEGORY_ICON_KEYS } from "@/lib/category-display";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().optional(),
  // Empty string from a cleared <select> (top-level / "No parent") is
  // normalized to undefined, same pattern as iconKey/accentColor below, so
  // it's never persisted as an empty string for the optional String? field.
  parentId: z
    .union([z.string().trim().min(1), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  isFeaturedOnHomepage: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
  // Empty string from a cleared <select> is normalized to undefined so it
  // never gets persisted as an empty string (Prisma expects null/undefined
  // for an optional String? field).
  iconKey: z
    .union([z.enum(FEATURED_CATEGORY_ICON_KEYS as [string, ...string[]]), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  accentColor: z
    .union([z.enum(FEATURED_CATEGORY_ACCENT_KEYS as [string, ...string[]]), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
