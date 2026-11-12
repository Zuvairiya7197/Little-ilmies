"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Landmark, Loader2, ShieldCheck } from "lucide-react";

/** Splits "Label: value" lines into rows, keeping any other line as a value. */
function parseDetails(details: string) {
  return details
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      return separator === -1
        ? { label: "", value: line }
        : { label: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
    });
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35ZM12.04 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97 1-3.62-.24-.37a9.8 9.8 0 0 1-1.5-5.22C2.23 6.54 6.63 2.15 12.05 2.15c2.62 0 5.09 1.02 6.94 2.88a9.75 9.75 0 0 1 2.87 6.94c0 5.42-4.4 9.82-9.82 9.82Zm8.35-18.17A11.72 11.72 0 0 0 12.04.18C5.54.18.25 5.46.25 11.96c0 2.08.54 4.1 1.57 5.89L.15 23.94l6.23-1.63a11.76 11.76 0 0 0 5.65 1.44h.01c6.5 0 11.79-5.28 11.79-11.78 0-3.15-1.22-6.11-3.44-8.34Z" />
    </svg>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be refused; the value stays selectable on screen.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="tap-target flex shrink-0 items-center justify-center rounded-xl text-ink-400 transition-colors hover:text-ink-600"
    >
      {copied ? <Check className="h-4 w-4 text-sage-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

/**
 * Checkout card for international buyers whose cards don't work. Placing
 * the order reserves it (coupon included) and leads to the payment
 * instructions page; the books unlock once the shop confirms the transfer.
 */
export function BankTransferOption({
  total,
  onPlaceOrder,
  isPlacing,
  accountEmail,
}: {
  total: string;
  onPlaceOrder: () => void;
  isPlacing: boolean;
  /** The signed-in buyer's email, where the instructions go. Bank transfer
   * needs an account (the cart is kept through sign-in). */
  accountEmail: string | null;
}) {
  const steps = [
    "Place your order — your price and any coupon discount are held for 7 days.",
    `Transfer ${total} from your bank, with your order reference in the note.`,
    "Send us the payment proof on WhatsApp.",
    "We confirm it and your books unlock in your account.",
  ];

  return (
    <div className="rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-50 text-ink-600">
          <Landmark className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-ink-700">Pay by bank transfer</h2>
          <p className="text-sm text-ink-400">Card not working? Pay straight from your bank instead.</p>
        </div>
      </div>

      <ol className="mt-4 flex flex-col gap-2.5">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-2.5 text-sm text-ink-500">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-bold text-ink-600">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      {accountEmail ? (
        <>
          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={isPlacing}
            className="btn-secondary mt-4 w-full disabled:opacity-60"
          >
            {isPlacing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Landmark className="h-4 w-4" aria-hidden="true" />
                Place order — pay {total} by bank transfer
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-ink-400">
            Payment details will be emailed to <span className="font-semibold text-ink-500">{accountEmail}</span>
          </p>
        </>
      ) : (
        <Link href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`} className="btn-secondary mt-4 w-full">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Sign in to pay by bank transfer
        </Link>
      )}
    </div>
  );
}

/** Bank details, reference and WhatsApp button for a placed bank transfer order. */
export function BankTransferInstructions({
  details,
  reference,
  amount,
  whatsappUrl,
}: {
  details: string;
  reference: string;
  amount: string;
  whatsappUrl: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 xs:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-xs text-ink-400">Amount to transfer</p>
            <p className="font-display text-xl font-bold text-ink-700">{amount}</p>
          </div>
          <CopyButton value={amount} label="amount" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-xs text-ink-400">Reference (write in transfer note)</p>
            <p className="font-mono text-xl font-bold tracking-wider text-ink-700">{reference}</p>
          </div>
          <CopyButton value={reference} label="reference" />
        </div>
      </div>

      <dl className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white px-3.5">
        {parseDetails(details).map(({ label, value }) => (
          <div key={`${label}${value}`} className="flex items-center justify-between gap-3 py-1.5">
            <div className="min-w-0">
              {label && <dt className="text-xs text-ink-400">{label}</dt>}
              <dd className="break-words text-sm font-semibold text-ink-700">{value}</dd>
            </div>
            <CopyButton value={value} label={label || "detail"} />
          </div>
        ))}
      </dl>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-[#06291B] transition-colors hover:bg-[#1FBD5A]"
      >
        <WhatsAppIcon />
        I&apos;ve paid — send proof on WhatsApp
      </a>

      <p className="flex items-start gap-2 text-xs text-ink-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
        We&apos;ll never ask for your card details, PIN or OTP on WhatsApp.
      </p>
    </div>
  );
}
