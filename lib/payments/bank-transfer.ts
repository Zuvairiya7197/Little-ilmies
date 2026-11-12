export interface BankTransferInfo {
  details: string;
  whatsappNumber: string;
}

/**
 * Manual fallback shown to international buyers at checkout. Stays hidden
 * until both env vars are set. Paid transfers aren't tracked by the site:
 * the buyer sends proof on WhatsApp and the order is handled by hand.
 */
export function getBankTransferInfo(): BankTransferInfo | null {
  const details = process.env.BANK_TRANSFER_DETAILS?.replace(/\\n/g, "\n").trim();
  const whatsappNumber = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");
  return details && whatsappNumber ? { details, whatsappNumber } : null;
}

/** How long a bank transfer order holds its price and coupon. */
export const BANK_TRANSFER_PAYMENT_DAYS = 7;

/** Unpaid bank transfer orders one account may have open at once, so the
 * order emails can't be used to flood an inbox or burn the email quota. */
export const MAX_OPEN_BANK_TRANSFER_ORDERS = 3;

export function bankTransferDeadline(createdAt: Date) {
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + BANK_TRANSFER_PAYMENT_DAYS);
  return deadline;
}

/** What the buyer writes in the transfer note, so the shop can match the
 * money to the order. Same last-8 characters as "Order #…" elsewhere. */
export function bankTransferReference(orderId: string) {
  return `LI-${orderId.slice(-8).toUpperCase()}`;
}

/** Opens WhatsApp to the shop with the order filled in. */
export function bankTransferWhatsAppUrl(
  whatsappNumber: string,
  { reference, amount, buyerName }: { reference: string; amount: string; buyerName: string }
) {
  const message = [
    "Hi Little Ilmies, I've paid by bank transfer.",
    "",
    `Order reference: ${reference}`,
    `Amount: ${amount}`,
    `Name: ${buyerName}`,
    "",
    "Payment proof:",
  ].join("\n");
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
