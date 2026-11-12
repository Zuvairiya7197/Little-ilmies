import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Download, XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { BankTransferInstructions } from "@/components/store/bank-transfer-option";
import {
  bankTransferDeadline,
  bankTransferReference,
  bankTransferWhatsAppUrl,
  getBankTransferInfo,
} from "@/lib/payments/bank-transfer";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Complete your payment",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

/** Payment instructions for a bank transfer order. The order id in the URL
 * is unguessable, and the page shows nothing beyond what the buyer needs
 * to pay (no email, no address). */
export default async function BankTransferPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await prisma.order.findFirst({
    where: { id: orderId, payments: { some: { provider: "BANK_TRANSFER" } } },
    include: { items: { include: { product: { select: { title: true } } } } },
  });
  const bankTransfer = getBankTransferInfo();
  if (!order || !bankTransfer) notFound();

  const currency = order.currencyCode as CurrencyCode;
  const reference = bankTransferReference(order.id);
  const amount = formatPrice(order.totalAmount, currency);
  const deadline = bankTransferDeadline(order.createdAt);
  const isExpired = order.status === "PENDING" && deadline < new Date();

  return (
    <div className="container-content max-w-2xl py-8 xl:py-12">
      {order.status === "PAID" ? (
        <div className="rounded-3xl bg-sage-50 p-6 text-center shadow-clay-sm">
          <CheckCircle2 className="mx-auto h-10 w-10 text-sage-600" aria-hidden="true" />
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-700">Payment received — JazakAllahu khairan!</h1>
          <p className="mt-2 text-sm text-ink-500">
            Your books are ready. Sign in with the email you ordered with to download them.
          </p>
          <Link href="/account/downloads" className="btn-primary mt-5">
            <Download className="h-4 w-4" aria-hidden="true" />
            Go to my downloads
          </Link>
        </div>
      ) : isExpired ? (
        <div className="rounded-3xl bg-cream-50 p-6 text-center shadow-clay-sm">
          <Clock className="mx-auto h-10 w-10 text-ink-300" aria-hidden="true" />
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-700">This order&apos;s payment window has ended</h1>
          <p className="mt-2 text-sm text-ink-500">
            Please place a new order. If you&apos;ve already sent the money, message us on WhatsApp with your reference{" "}
            <span className="font-mono font-semibold">{reference}</span> and we&apos;ll sort it out.
          </p>
          <Link href="/shop" className="btn-primary mt-5">
            Back to the shop
          </Link>
        </div>
      ) : order.status !== "PENDING" ? (
        <div className="rounded-3xl bg-cream-50 p-6 text-center shadow-clay-sm">
          <XCircle className="mx-auto h-10 w-10 text-ink-300" aria-hidden="true" />
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-700">This order was cancelled</h1>
          <p className="mt-2 text-sm text-ink-500">If you already sent money for it, please message us on WhatsApp.</p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-6 w-6 shrink-0 text-gold-600" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-700 xs:text-3xl">
                Your order is reserved until{" "}
                {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Transfer the exact amount below with your reference in the note, then send us the proof. We&apos;ve
                also emailed you these details, so you can pay later from your banking app.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
            <BankTransferInstructions
              details={bankTransfer.details}
              reference={reference}
              amount={amount}
              whatsappUrl={bankTransferWhatsAppUrl(bankTransfer.whatsappNumber, {
                reference,
                amount,
                buyerName: order.buyerName,
              })}
            />
          </div>
        </>
      )}

      <div className="mt-6 rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
        <h2 className="font-display text-lg font-bold text-ink-700">Order {reference}</h2>
        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-500">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="truncate">{item.product?.title ?? "Book bundle"}</span>
              <span className="shrink-0">{formatPrice(item.unitPrice * item.quantity, currency)}</span>
            </li>
          ))}
          {order.discountAmount > 0 && (
            <li className="flex justify-between gap-3 text-sage-700">
              <span>Coupon discount</span>
              <span>- {formatPrice(order.discountAmount, currency)}</span>
            </li>
          )}
          <li className="mt-1 flex justify-between gap-3 border-t border-ink-100 pt-2 font-semibold text-ink-700">
            <span>Total</span>
            <span>{amount}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
