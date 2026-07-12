import { z } from "zod";

export const couponFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .regex(/^[A-Z0-9-]+$/, "Uppercase letters, numbers, and hyphens only"),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.coerce.number().min(0, "Must be 0 or more"),
  isActive: z.boolean().default(true),
  maxRedemptions: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;
