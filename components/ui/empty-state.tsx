import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center xs:py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 text-sage-400">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-ink-600">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-ink-300">{description}</p>
      </div>
      {action}
    </div>
  );
}
