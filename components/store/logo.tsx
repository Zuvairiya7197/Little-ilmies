import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className="tap-target group flex items-center"
      aria-label="Little Ilmies home"
    >
      <Image
        src="/images/little_ilmies_logo_cropped.png"
        alt="Little Ilmies"
        width={988}
        height={574}
        priority
        className={cn("h-12 w-auto xs:h-14", className)}
      />
    </Link>
  );
}
