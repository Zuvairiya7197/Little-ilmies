import { ShieldCheck } from "lucide-react";
import { BUSINESS } from "@/lib/business";

/** Seller and grievance officer contact, as the E-Commerce Rules require. */
export function SellerDetails() {
  return (
    <section aria-labelledby="seller-details-heading" className="border-t border-ink-100 bg-cream py-10">
      <div className="container-content">
        <div className="mx-auto grid max-w-3xl gap-6 rounded-3xl bg-cream-50 p-6 shadow-clay-sm sm:grid-cols-2">
          <div>
            <h2 id="seller-details-heading" className="font-display text-lg font-bold text-ink-700">
              Seller details
            </h2>
            <dl className="mt-3 flex flex-col gap-1.5 text-sm text-ink-500">
              <div>
                <dt className="inline font-semibold text-ink-600">Store: </dt>
                <dd className="inline">{BUSINESS.tradingName}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ink-600">Operated by: </dt>
                <dd className="inline">{BUSINESS.ownerName}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ink-600">Address: </dt>
                <dd className="inline">{BUSINESS.address}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ink-600">Customer care: </dt>
                <dd className="inline">
                  <a href={BUSINESS.phoneHref} className="text-sage-700 hover:underline">
                    {BUSINESS.phone}
                  </a>{" "}
                  ·{" "}
                  <a href={`mailto:${BUSINESS.email}`} className="text-sage-700 hover:underline">
                    {BUSINESS.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-700">
              <ShieldCheck className="h-5 w-5 text-sage-700" aria-hidden="true" />
              Grievance Officer
            </h2>
            <dl className="mt-3 flex flex-col gap-1.5 text-sm text-ink-500">
              <div>
                <dt className="inline font-semibold text-ink-600">Name: </dt>
                <dd className="inline">{BUSINESS.ownerName} ({BUSINESS.ownerRole})</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ink-600">Email: </dt>
                <dd className="inline">
                  <a href={`mailto:${BUSINESS.email}`} className="text-sage-700 hover:underline">
                    {BUSINESS.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ink-600">Phone: </dt>
                <dd className="inline">
                  <a href={BUSINESS.phoneHref} className="text-sage-700 hover:underline">
                    {BUSINESS.phone}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              We acknowledge complaints within 48 hours and resolve them within one month.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
