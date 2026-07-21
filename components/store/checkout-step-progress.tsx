import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const steps = ["Cart", "Details", "Payment", "Review"] as const;

/** Mobile & tablet: decorative step tracker showing where "Details" (this
 * page) sits in the checkout flow. Payment happens in the Razorpay modal
 * from this same step, and Review is effectively the payment-success page —
 * there's no separate step-by-step wizard behind these markers. */
export function CheckoutStepProgress({ activeStep = 1 }: { activeStep?: number }) {
  return (
    <div className="flex items-center justify-between md:hidden" aria-hidden="true">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                i < activeStep
                  ? "bg-ink-200 text-ink-600"
                  : i === activeStep
                    ? "bg-ink-600 text-cream-50"
                    : "bg-cream-50 text-ink-300 shadow-clay-sm"
              )}
            >
              {i < activeStep ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn("text-xs font-medium", i === activeStep ? "text-ink-700" : "text-ink-300")}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className={cn("mx-2 mb-5 h-px flex-1", i < activeStep ? "bg-ink-400" : "bg-ink-100")} />
          )}
        </div>
      ))}
    </div>
  );
}
