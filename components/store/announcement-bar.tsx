import Link from "next/link";
import type { ActiveSale } from "@/lib/settings/pricing-settings";

function lastDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

export function AnnouncementBar({ activeSale = null }: { activeSale?: ActiveSale | null }) {
  if (activeSale?.name && activeSale.endsOn) {
    return (
      <div className="bg-blossom-50 py-2 text-center text-xs font-semibold tracking-wide text-blossom-600 xs:text-[13px]">
        <p className="container-content">
          🎉 {activeSale.name}: every book is on sale until {lastDay(activeSale.endsOn)}.{" "}
          <Link href="/shop" className="underline underline-offset-2">
            Shop now
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-ink-100 py-2 text-center text-xs font-semibold tracking-wide text-ink-600 xs:text-[13px]">
      <p className="container-content">⭐ Instant download. Read anywhere, anytime.</p>
    </div>
  );
}
