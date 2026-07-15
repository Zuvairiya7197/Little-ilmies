import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

export function AccountNavCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string | number;
}) {
  return (
    <Link
      href={href}
      className="card-surface tap-target flex items-center gap-4 p-4 transition-all duration-200 hover:shadow-clay-sm xs:p-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600 shadow-clay-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-semibold text-ink-700">{title}</p>
        <p className="mt-0.5 text-sm text-ink-400">{description}</p>
      </div>
      {badge !== undefined && (
        <span className="shrink-0 rounded-full bg-gold-50 px-2.5 py-1 text-xs font-bold text-gold-700 shadow-clay-sm">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-200" aria-hidden="true" />
    </Link>
  );
}
