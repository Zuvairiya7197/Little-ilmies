import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  CloudDownload,
  Download,
  Heart,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getOrdersForUser } from "@/lib/db/orders";
import { LogoutButton } from "@/components/account/logout-button";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    body: "Your data is always safe with us.",
    tint: "bg-gold-50 text-gold-500",
  },
  {
    icon: CloudDownload,
    title: "Instant Access",
    body: "Download and read your books instantly.",
    tint: "bg-teal-50 text-teal-500",
  },
  {
    icon: Heart,
    title: "Made with Love",
    body: "For little hearts and curious minds.",
    tint: "bg-blossom-50 text-blossom-500",
  },
  {
    icon: Star,
    title: "Trusted by Parents",
    body: "Loved by thousands of families.",
    tint: "bg-lemon-50 text-lemon-500",
  },
] as const;

function AccountActionCard({
  href,
  icon: Icon,
  title,
  description,
  tint,
  badge,
}: {
  href: string;
  icon: typeof Receipt;
  title: string;
  description: string;
  tint: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-7 rounded-[1.4rem] bg-cream-50 px-8 py-6 shadow-clay-sm transition-transform hover:-translate-y-0.5 xl:gap-4 xl:rounded-2xl xl:p-3.5"
    >
      <span className={`relative flex h-[5.25rem] w-[5.25rem] shrink-0 items-center justify-center rounded-3xl shadow-soft xl:h-14 xl:w-14 xl:rounded-2xl ${tint}`}>
        <Icon className="h-11 w-11 xl:h-7 xl:w-7" aria-hidden="true" />
        {badge !== undefined && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blossom-500 px-1 text-[10px] font-bold text-cream-50">
            {badge}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.65rem] font-bold leading-tight text-ink-700 xl:text-sm">{title}</span>
        <span className="mt-1.5 block text-[1.35rem] font-medium leading-snug text-ink-400 xl:mt-0.5 xl:text-xs">{description}</span>
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-blossom-600 transition-colors group-hover:bg-ink-600 group-hover:text-cream-50 xl:h-8 xl:w-8 xl:bg-blossom-50 xl:shadow-soft">
        <ChevronRight className="h-8 w-8 xl:h-4 xl:w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

export default async function AccountPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const orders = await getOrdersForUser(userId);

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20 pb-44 pt-10 xl:pb-16 xl:pt-10">
      <Image
        src="/images/rainbow.png"
        alt=""
        width={120}
        height={70}
        className="pointer-events-none absolute left-7 top-16 hidden h-auto w-24 object-contain opacity-80 xl:block"
        aria-hidden="true"
      />
      <Image
        src="/images/rainbow.png"
        alt=""
        width={120}
        height={70}
        className="pointer-events-none absolute right-12 top-14 hidden h-auto w-24 scale-x-[-1] object-contain opacity-80 xl:block"
        aria-hidden="true"
      />
      <Image
        src="/images/star.png"
        alt=""
        width={36}
        height={36}
        className="pointer-events-none absolute right-24 top-32 hidden h-8 w-8 -rotate-12 object-contain opacity-80 xl:block"
        aria-hidden="true"
      />
      <Image
        src="/images/star.png"
        alt=""
        width={36}
        height={36}
        className="pointer-events-none absolute left-12 top-56 hidden h-7 w-7 rotate-12 object-contain opacity-80 xl:block"
        aria-hidden="true"
      />

      <div className="container-content relative">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-5xl font-bold text-ink-700 xl:text-4xl">
            My Account <span className="text-blossom-400">⌁</span>
          </h1>
          <p className="mt-5 text-2xl font-semibold leading-relaxed text-ink-400 xl:mt-3 xl:text-sm">
            Signed in as <br className="xl:hidden" />
            <span className="text-ink-700">{session.user.email}</span>{" "}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-600 align-middle text-cream-50 xl:h-5 xl:w-5">
              <Heart className="h-4 w-4 fill-cream-50 xl:h-3 xl:w-3" aria-hidden="true" />
            </span>
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-[42rem] flex-col gap-4 xl:mt-5 xl:max-w-xl xl:gap-3">
          <AccountActionCard
            href="/account/purchase-history"
            icon={Receipt}
            title="Purchase History"
            description="View your past orders and receipts."
            tint="bg-sage-50 text-sage-600"
            badge={orders.length || undefined}
          />
          <AccountActionCard
            href="/account/downloads"
            icon={Download}
            title="Downloads"
            description="Access your purchased e-books."
            tint="bg-gold-50 text-gold-500"
          />
          <AccountActionCard
            href="/wishlist"
            icon={Heart}
            title="Wishlist"
            description="Books you've saved for later."
            tint="bg-blossom-50 text-blossom-500"
          />
          <AccountActionCard
            href="/cart"
            icon={ShoppingBag}
            title="Saved Cart"
            description="Continue where you left off."
            tint="bg-lemon-50 text-lemon-500"
          />
          <AccountActionCard
            href="/account/details"
            icon={User}
            title="Account Details"
            description="Manage your name, email and preferences."
            tint="bg-sage-50 text-sage-500"
          />
        </div>

        <div className="mx-auto mt-6 max-w-[42rem] xl:mt-4 xl:max-w-xl">
          <LogoutButton className="tap-target flex w-full items-center justify-center gap-4 rounded-2xl bg-blossom-50/70 py-5 text-2xl font-bold text-blossom-600 shadow-clay-sm transition-colors hover:bg-blossom-100 [&_svg]:h-7 [&_svg]:w-7 xl:gap-2 xl:py-3 xl:text-sm xl:[&_svg]:h-4 xl:[&_svg]:w-4" />
        </div>

        <section className="mx-auto mt-9 grid max-w-[48rem] grid-cols-4 gap-0 rounded-3xl bg-cream-50/90 px-4 py-7 shadow-soft xl:mt-5 xl:max-w-5xl xl:grid-cols-4 xl:gap-3 xl:p-3">
          {trustItems.map(({ icon: Icon, title, body, tint }) => (
            <div key={title} className="flex flex-col items-center gap-3 border-r border-ink-100 px-3 text-center last:border-r-0 xl:flex-row xl:gap-3 xl:px-0 xl:pr-3 xl:text-left">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-soft xl:h-12 xl:w-12 ${tint}`}>
                <Icon className="h-8 w-8 xl:h-6 xl:w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-tight text-ink-700 xl:text-xs">{title}</h2>
                <p className="mt-2 text-base leading-snug text-ink-500 xl:mt-0.5 xl:text-[11px] xl:leading-tight xl:text-ink-400">{body}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
