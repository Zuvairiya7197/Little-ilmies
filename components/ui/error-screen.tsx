import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type ErrorAction = {
  href?: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "plain";
};

export function ErrorScreen({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  icon: Icon,
  actions,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  icon?: LucideIcon;
  actions: ErrorAction[];
  compact?: boolean;
}) {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-7rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-blossom-50/20 to-ink-50/20 px-4 py-3 text-center">
      <section className="flex w-full max-w-4xl flex-col items-center justify-center">
        {image ? (
          <div className={`relative w-full ${compact ? "h-[clamp(8rem,24svh,15rem)] max-w-[min(24rem,82vw)]" : "h-[clamp(9rem,28svh,18rem)] max-w-[min(30rem,86vw)]"}`}>
            <Image
              src={image}
              alt={imageAlt ?? ""}
              fill
              sizes="(max-width: 768px) 86vw, 480px"
              className="object-contain"
              priority
            />
          </div>
        ) : Icon ? (
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-50 text-ink-600 shadow-soft">
            <Icon className="h-8 w-8" aria-hidden="true" />
          </span>
        ) : null}

        <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-sage-700">{eyebrow}</p>
        <h1 className="mt-2 max-w-2xl font-display text-[clamp(1.85rem,5vw,3.5rem)] font-bold leading-tight text-ink-700">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-ink-400 sm:text-base">
          {description}
        </p>

        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          {actions.map((action) => {
            const className =
              action.variant === "secondary"
                ? "btn-secondary rounded-2xl px-6 py-2.5 text-sm sm:text-base"
                : action.variant === "plain"
                  ? "tap-target inline-flex items-center gap-2 text-sm font-semibold text-ink-400 hover:text-ink-600"
                  : "btn-primary rounded-2xl px-6 py-2.5 text-sm sm:text-base";
            const ActionIcon = action.icon;
            const content = (
              <>
                {ActionIcon && <ActionIcon className="h-4 w-4" aria-hidden="true" />}
                {action.label}
              </>
            );

            if (action.onClick) {
              return (
                <button key={action.label} type="button" onClick={action.onClick} className={className}>
                  {content}
                </button>
              );
            }

            return (
              <Link key={action.label} href={action.href ?? "/"} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
