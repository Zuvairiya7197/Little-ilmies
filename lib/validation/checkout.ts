import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/**
 * Request body for POST /api/checkout/create-order. Deliberately carries
 * only product identity + quantity — never a price or currency. The
 * backend resolves both itself from ProductPrice + verified region.
 */
const productCheckoutItemSchema = z.object({
  type: z.literal("PRODUCT").default("PRODUCT"),
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

const customBundleCheckoutItemSchema = z.object({
  type: z.literal("CUSTOM_BUNDLE"),
  bundleId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
  selectedProductIds: z.array(z.string().min(1)).min(1).max(100),
});

export const checkoutItemSchema = z.union([customBundleCheckoutItemSchema, productCheckoutItemSchema]);

export const createOrderRequestSchema = z.object({
  buyerName: z.string().trim().min(2),
  buyerEmail: z.string().trim().email(),
  items: z.array(checkoutItemSchema).min(1),
  couponCode: z.string().trim().optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const verifyPaymentRequestSchema = z.object({
  orderId: z.string().min(1), // our internal Order.id
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type VerifyPaymentRequest = z.infer<typeof verifyPaymentRequestSchema>;
