import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  Lock,
  Mail,
  Pencil,
  ShieldCheck,
  User,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";

export const metadata: Metadata = {
  title: "Account Details",
  robots: { index: false },
};

function EnabledBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-base font-bold text-sage-700 xl:px-3 xl:py-1.5 xl:text-xs">
      Enabled
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-500 text-cream-50 xl:h-5 xl:w-5">
        <Check className="h-4 w-4 xl:h-3.5 xl:w-3.5" aria-hidden="true" />
      </span>
    </span>
  );
}

function EditButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="tap-target flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft transition-colors hover:bg-blossom-100 xl:h-auto xl:w-auto xl:bg-gold-50 xl:text-gold-500 xl:hover:bg-gold-100"
    >
      <Pencil className="h-8 w-8 xl:h-5 xl:w-5" aria-hidden="true" />
    </button>
  );
}

export default async function AccountDetailsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const name = session.user.name ?? "Little Ilmies Admin";
  const email = session.user.email ?? "";

  return (
    <div className="relative isolate min-h-[calc(100vh-8rem)] overflow-hidden bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20 pb-44 pt-14 xl:pb-5 xl:pt-4">
      <div className="container-content relative">
        <Link
          href="/account"
          className="tap-target hidden items-center gap-2 text-base font-semibold text-ink-500 hover:text-ink-700 xl:inline-flex"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Back to My Account
        </Link>

        <div className="grid min-h-40 grid-cols-[1fr_18rem] items-center gap-4 xl:mt-3 xl:min-h-28 xl:grid-cols-[1fr_22rem]">
          <div>
            <h1 className="font-display text-5xl font-bold leading-tight text-ink-700 xl:text-4xl">
              Account Details <span className="text-blossom-400">♥</span>
            </h1>
            <p className="mt-7 text-2xl font-medium text-ink-500 xl:mt-2 xl:text-lg xl:text-ink-400">
              Manage your profile and email preferences.
            </p>
          </div>
          <div className="relative h-36 xl:h-28">
            <Image
              src="/images/account details.png"
              alt=""
              fill
              sizes="352px"
              className="object-contain object-right"
              aria-hidden="true"
              priority
            />
          </div>
        </div>

        <section className="mt-8 rounded-[2rem] bg-cream-50 p-9 shadow-clay-sm xl:mt-3 xl:rounded-3xl xl:p-5">
          <div className="grid gap-7 xl:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.7fr)_auto] xl:items-center xl:gap-4">
            <div className="flex min-w-0 items-start gap-6">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft xl:h-14 xl:w-14 xl:bg-gold-50 xl:text-gold-500">
                <User className="h-10 w-10 xl:h-7 xl:w-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-3xl font-bold text-ink-700 xl:text-lg">Profile</h2>
                <p className="mt-3 max-w-xs text-2xl leading-relaxed text-ink-500 xl:mt-1 xl:text-sm xl:text-ink-400">
                  Basic details linked to your orders and account.
                </p>
              </div>
            </div>

            <div className="grid gap-7 xl:grid-cols-2 xl:gap-4">
              <div>
                <p className="mb-3 text-lg font-bold text-ink-700 xl:mb-1.5 xl:text-sm">Name</p>
                <div className="flex min-h-16 items-center gap-5 rounded-2xl border border-blossom-100 bg-cream-50 px-5 shadow-clay-pressed xl:min-h-11 xl:gap-3 xl:border-ink-100 xl:px-3.5">
                  <User className="h-6 w-6 text-blossom-500 xl:h-4 xl:w-4 xl:text-gold-400" aria-hidden="true" />
                  <span className="truncate text-xl font-medium text-ink-600 xl:text-sm">{name}</span>
                </div>
              </div>
              <div>
                <p className="mb-3 text-lg font-bold text-ink-700 xl:mb-1.5 xl:text-sm">Email</p>
                <div className="flex min-h-16 items-center gap-5 rounded-2xl border border-blossom-100 bg-cream-50 px-5 shadow-clay-pressed xl:min-h-11 xl:gap-3 xl:border-ink-100 xl:px-3.5">
                  <Mail className="h-6 w-6 text-blossom-500 xl:h-4 xl:w-4 xl:text-gold-400" aria-hidden="true" />
                  <span className="truncate text-xl font-medium text-ink-600 xl:text-sm">{email}</span>
                </div>
              </div>
            </div>

            <div className="justify-self-end xl:justify-self-auto">
              <EditButton label="Edit profile details" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-cream-50 p-9 shadow-clay-sm xl:mt-3 xl:rounded-3xl xl:p-5">
          <div className="grid gap-7 xl:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.7fr)_auto] xl:items-center xl:gap-4">
            <div className="flex min-w-0 items-start gap-6">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft xl:h-14 xl:w-14 xl:bg-gold-50 xl:text-gold-500">
                <Mail className="h-10 w-10 xl:h-7 xl:w-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-3xl font-bold text-ink-700 xl:text-lg">Sign-in Email</h2>
                <p className="mt-3 max-w-md text-2xl leading-relaxed text-ink-500 xl:mt-1 xl:max-w-xs xl:text-sm xl:text-ink-400">
                  We use this email for magic-link login, receipts, and secure download access.
                </p>
              </div>
            </div>

            <div>
            <p className="mb-3 text-lg font-bold text-ink-700 xl:hidden">Email</p>
            <div className="flex min-h-16 items-center gap-5 rounded-2xl border border-blossom-100 bg-cream-50 px-5 shadow-clay-pressed xl:min-h-11 xl:gap-3 xl:border-ink-100 xl:px-3.5">
              <Mail className="h-6 w-6 text-blossom-500 xl:h-4 xl:w-4 xl:text-gold-400" aria-hidden="true" />
              <span className="truncate text-xl font-medium text-ink-600 xl:text-sm">{email}</span>
            </div>
            </div>

            <div className="justify-self-end xl:justify-self-auto">
              <EditButton label="Edit sign-in email" />
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-7 xl:mt-3 xl:gap-3">
          <div className="rounded-3xl bg-cream-50 p-7 shadow-clay-sm xl:p-5">
            <div className="flex flex-col gap-5">
              <div className="flex min-w-0 items-start gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-500 shadow-soft xl:h-14 xl:w-14">
                  <Bell className="h-9 w-9 xl:h-7 xl:w-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-700 xl:text-lg">Order Updates</h2>
                  <p className="mt-3 max-w-sm text-xl leading-relaxed text-ink-500 xl:mt-1 xl:text-sm xl:text-ink-400">
                    Purchase confirmations and download links are sent automatically.
                  </p>
                </div>
              </div>
              <EnabledBadge />
            </div>
            <div className="mt-6 border-t border-dashed border-ink-100 pt-5 xl:mt-3 xl:pt-3">
              <p className="flex flex-wrap items-start gap-3 text-base font-medium leading-relaxed text-violet-600 xl:items-center xl:gap-2 xl:text-xs xl:text-ink-400">
                <Mail className="mt-1 h-5 w-5 text-blossom-500 xl:mt-0 xl:h-4 xl:w-4 xl:text-gold-500" aria-hidden="true" />
                You&apos;ll receive updates at
                <span className="font-semibold text-violet-600 xl:text-gold-500">{email}</span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-cream-50 p-7 shadow-clay-sm xl:p-5">
            <div className="flex flex-col gap-5">
              <div className="flex min-w-0 items-start gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600 shadow-soft xl:h-14 xl:w-14">
                  <ShieldCheck className="h-9 w-9 xl:h-7 xl:w-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-700 xl:text-lg">Secure Access</h2>
                  <p className="mt-3 max-w-sm text-xl leading-relaxed text-ink-500 xl:mt-1 xl:text-sm xl:text-ink-400">
                    Downloads are safely attached to the email used at checkout.
                  </p>
                </div>
              </div>
              <EnabledBadge />
            </div>
            <div className="mt-6 border-t border-dashed border-ink-100 pt-5 xl:mt-3 xl:pt-3">
              <p className="flex items-start gap-3 text-base font-semibold leading-relaxed text-violet-600 xl:items-center xl:gap-2 xl:text-xs xl:text-gold-500">
                <Lock className="mt-1 h-5 w-5 xl:mt-0 xl:h-4 xl:w-4" aria-hidden="true" />
                Your account and downloads are protected
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-ink-100 bg-blossom-50/20 px-7 py-6 shadow-soft xl:mt-3 xl:bg-gold-50/30 xl:px-6 xl:py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-6 xl:gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cream-50 text-blossom-600 shadow-soft xl:h-12 xl:w-12 xl:bg-gold-50 xl:text-gold-500">
                <ShieldCheck className="h-8 w-8 xl:h-6 xl:w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink-700 xl:text-base">Your data is safe with us</h2>
                <p className="mt-2 max-w-md text-lg leading-relaxed text-ink-500 xl:mt-0.5 xl:text-sm">
                  We never share your email. All your information is encrypted and secure.
                </p>
              </div>
            </div>
            <div className="relative h-28 w-48 shrink-0 xl:h-24 xl:w-60">
              <Image
                src="/images/your data is safe with us.png"
                alt=""
                fill
                sizes="240px"
                className="object-contain"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
