import { cn } from "@/lib/utils/cn";

const styles: Record<string, string> = {
  PAID: "bg-sage-50 text-sage-700",
  PENDING: "bg-gold-50 text-gold-700",
  FAILED: "bg-ink-100 text-ink-500",
  REFUNDED: "bg-ink-100 text-ink-500",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", styles[status] ?? styles.FAILED)}>
      {status}
    </span>
  );
}
