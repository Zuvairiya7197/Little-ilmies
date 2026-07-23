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
    <span className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold text-sage-700">
      Enabled
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-500 text-cream-50">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </span>
  );
}

function EditButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="tap-target flex shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-500 shadow-soft transition-colors hover:bg-gold-100"
    >
      <Pencil className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export default async function AccountDetailsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const name = session.user.name ?? "Little Ilmies Admin";
  const email = session.user.email ?? "";

  return (
    <div className="relative isolate min-h-[calc(100vh-8rem)] overflow-hidden bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20 pb-6 pt-3 md:pb-5 md:pt-4">
      <div className="container-content relative">
        <Link
          href="/account"
          className="tap-target inline-flex items-center gap-2 text-base font-semibold text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Back to My Account
        </Link>

        <div className="mt-3 grid min-h-0 items-center gap-3 md:min-h-28 md:grid-cols-[1fr_22rem] md:gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight text-ink-700 xs:text-4xl">
              Account Details <span className="text-blossom-400">♥</span>
            </h1>
            <p className="mt-2 text-base font-medium text-ink-400 md:text-lg">
              Manage your profile and email preferences.
            </p>
          </div>
          <div className="relative hidden h-28 md:block">
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

        <section className="mt-3 rounded-3xl bg-cream-50 p-4 shadow-clay-sm md:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.7fr)_auto] md:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-500 shadow-soft">
                <User className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink-700">Profile</h2>
                <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-400">
                  Basic details linked to your orders and account.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-sm font-bold text-ink-700">Name</p>
                <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-ink-100 bg-cream-50 px-3.5 shadow-clay-pressed">
                  <User className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  <span className="truncate text-sm font-medium text-ink-600">{name}</span>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-bold text-ink-700">Email</p>
                <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-ink-100 bg-cream-50 px-3.5 shadow-clay-pressed">
                  <Mail className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  <span className="truncate text-sm font-medium text-ink-600">{email}</span>
                </div>
              </div>
            </div>

            <div className="justify-self-end md:justify-self-auto">
              <EditButton label="Edit profile details" />
            </div>
          </div>
        </section>

        <section className="mt-3 rounded-3xl bg-cream-50 p-4 shadow-clay-sm md:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.7fr)_auto] md:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-500 shadow-soft">
                <Mail className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink-700">Sign-in Email</h2>
                <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-400">
                  We use this email for magic-link login, receipts, and secure download access.
                </p>
              </div>
            </div>

            <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-ink-100 bg-cream-50 px-3.5 shadow-clay-pressed">
              <Mail className="h-4 w-4 text-gold-400" aria-hidden="true" />
              <span className="truncate text-sm font-medium text-ink-600">{email}</span>
            </div>

            <div className="justify-self-end md:justify-self-auto">
              <EditButton label="Edit sign-in email" />
            </div>
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-3xl bg-cream-50 p-4 shadow-clay-sm md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-500 shadow-soft">
                  <Bell className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-700">Order Updates</h2>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-400">
                    Purchase confirmations and download links are sent automatically.
                  </p>
                </div>
              </div>
              <EnabledBadge />
            </div>
            <div className="mt-3 border-t border-dashed border-ink-100 pt-3">
              <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-400">
                <Mail className="h-4 w-4 text-gold-500" aria-hidden="true" />
                You&apos;ll receive updates at
                <span className="font-semibold text-gold-500">{email}</span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-cream-50 p-4 shadow-clay-sm md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600 shadow-soft">
                  <ShieldCheck className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-700">Secure Access</h2>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-400">
                    Downloads are safely attached to the email used at checkout.
                  </p>
                </div>
              </div>
              <EnabledBadge />
            </div>
            <div className="mt-3 border-t border-dashed border-ink-100 pt-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-gold-500">
                <Lock className="h-4 w-4" aria-hidden="true" />
                Your account and downloads are protected
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-3 max-w-6xl overflow-hidden rounded-3xl border border-ink-100 bg-gold-50/30 px-4 py-3 shadow-soft md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-500 shadow-soft">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-ink-700">Your data is safe with us</h2>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-500">
                  We never share your email. All your information is encrypted and secure.
                </p>
              </div>
            </div>
            <div className="relative hidden h-24 w-60 shrink-0 md:block">
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
