import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="tap-target group flex items-center gap-2"
      aria-label="Little Ilmies home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-sage-700 transition-colors group-hover:bg-sage-200">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4.5C6.5 3.5 9.5 3.5 12 5C14.5 3.5 17.5 3.5 20 4.5V18.5C17.5 17.5 14.5 17.5 12 19C9.5 17.5 6.5 17.5 4 18.5V4.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 5V19"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold leading-none text-ink-600">
        Little Ilmies
      </span>
    </Link>
  );
}
