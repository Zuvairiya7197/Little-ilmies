"use client";

import { Landmark, MessageCircle } from "lucide-react";
import type { BankTransferInfo } from "@/lib/payments/bank-transfer";

export function BankTransferOption({
  bankTransfer,
  total,
  items,
  getBuyer,
}: {
  bankTransfer: BankTransferInfo;
  total: string;
  items: string[];
  getBuyer: () => { fullName?: string; email?: string };
}) {
  function openWhatsApp() {
    const { fullName, email } = getBuyer();
    const message = [
      "Hi Little Ilmies, I've paid by bank transfer.",
      "",
      `Name: ${fullName ?? ""}`,
      `Email: ${email ?? ""}`,
      `Total: ${total}`,
      "Books:",
      ...items.map((item) => `- ${item}`),
      "",
      "Payment proof:",
    ].join("\n");
    window.open(
      `https://wa.me/${bankTransfer.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-700">
        <Landmark className="h-5 w-5 text-ink-500" aria-hidden="true" />
        Pay by bank transfer
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        If none of these payment options work for you, transfer {total} to the account below, then share your
        payment details with us on WhatsApp. We&apos;ll send your books once we&apos;ve confirmed your payment.
      </p>
      <p className="mt-3 whitespace-pre-line break-words rounded-2xl bg-ink-50 px-3.5 py-3 text-sm font-semibold text-ink-600">
        {bankTransfer.details}
      </p>
      <button type="button" onClick={openWhatsApp} className="btn-secondary mt-3 w-full">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Share payment details on WhatsApp
      </button>
    </div>
  );
}
