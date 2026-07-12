import { z } from "zod";

export const buyerLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export type BuyerLoginFormValues = z.infer<typeof buyerLoginSchema>;
