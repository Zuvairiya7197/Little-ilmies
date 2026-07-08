export function IconBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-cream-50"
      aria-hidden="true"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
