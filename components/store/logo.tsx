import Link from "next/link";
import Image from "next/image";

export function Logo() {
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
        className="h-12 w-auto xs:h-14"
      />
    </Link>
  );
}
