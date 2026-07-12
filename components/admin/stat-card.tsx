import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card-surface flex items-center gap-4 p-4 xs:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-300">{label}</p>
        <p className="truncate font-display text-xl font-semibold text-ink-700">{value}</p>
      </div>
    </div>
  );
}
