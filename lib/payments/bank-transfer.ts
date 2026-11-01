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
