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
      className="group flex items-center gap-4 rounded-2xl bg-cream-50 p-3.5 shadow-clay-sm transition-transform hover:-translate-y-0.5"
    >
      <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-soft ${tint}`}>
        <Icon className="h-7 w-7" aria-hidden="true" />
        {badge !== undefined && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blossom-500 px-1 text-[10px] font-bold text-cream-50">
            {badge}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-sm font-bold text-ink-700">{title}</span>
        <span className="mt-0.5 block text-xs font-medium text-ink-400">{description}</span>
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft transition-colors group-hover:bg-ink-600 group-hover:text-cream-50">
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20 pb-24 pt-8 xl:pb-16 xl:pt-10">
      <Image
        src="/images/rainbow.png"
        alt=""
        width={120}
        height={70}
        className="pointer-events-none absolute left-7 top-16 h-auto w-24 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/rainbow.png"
        alt=""
        width={120}
        height={70}
        className="pointer-events-none absolute right-12 top-14 h-auto w-24 scale-x-[-1] object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/star.png"
        alt=""
        width={36}
        height={36}
        className="pointer-events-none absolute right-24 top-32 h-8 w-8 -rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/star.png"
        alt=""
        width={36}
        height={36}
        className="pointer-events-none absolute left-12 top-56 h-7 w-7 rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />

      <div className="container-content relative">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-bold text-ink-700 xs:text-4xl">
            My Account <span className="text-blossom-400">⌁</span>
          </h1>
          <p className="mt-3 text-sm font-semibold text-ink-500">
            Signed in as <span className="text-ink-700">{session.user.email}</span>{" "}
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink-600 align-middle text-cream-50">
              <Heart className="h-3 w-3 fill-cream-50" aria-hidden="true" />
            </span>
          </p>
        </div>

        <div className="mx-auto mt-5 flex max-w-xl flex-col gap-3">
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

        <div className="mx-auto mt-4 max-w-xl">
          <LogoutButton className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-blossom-50/70 py-3 text-sm font-bold text-blossom-600 shadow-clay-sm transition-colors hover:bg-blossom-100" />
        </div>

        <section className="mx-auto mt-5 grid max-w-5xl grid-cols-1 gap-3 rounded-3xl bg-cream-50/90 p-3 shadow-soft sm:grid-cols-2 xl:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, body, tint }) => (
            <div key={title} className="flex items-center gap-3 border-ink-100 xl:border-r xl:last:border-r-0 xl:pr-3">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-soft ${tint}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 text-left">
                <h2 className="text-xs font-bold text-ink-700">{title}</h2>
                <p className="mt-0.5 text-[11px] leading-tight text-ink-400">{body}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
