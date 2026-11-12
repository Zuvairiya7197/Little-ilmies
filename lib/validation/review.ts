import { z } from "zod";

export const reviewFormSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  authorName: z.string().trim().min(2, "Enter the name to show").max(40),
  title: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((title) => title || undefined),
  body: z.string().trim().min(20, "Tell other parents a little more (at least 20 characters)").max(2000),
});

export type ReviewFormValues = z.input<typeof reviewFormSchema>;

export const reviewModerationSchema = z.object({
  action: z.enum(["approve", "reject"]),
  /** The review's updatedAt as the admin saw it, so an edit made after the
   * page loaded can't be approved unseen. */
  seenUpdatedAt: z.string().datetime(),
});

/** A review an admin types in for a parent who was given a free copy. */
export const giftedReviewSchema = z.object({
  productId: z.string().min(1, "Choose the book"),
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  authorName: z.string().trim().min(2, "Enter the parent's name to show").max(40),
  title: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((title) => title || undefined),
  body: z.string().trim().min(10, "Enter the review").max(2000),
});
