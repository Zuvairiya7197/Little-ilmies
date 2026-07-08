import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < Math.round(rating) ? "fill-gold-400 text-gold-400" : "fill-ink-100 text-ink-100"
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
