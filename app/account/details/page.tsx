import type { Metadata } from "next";
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold text-sage-700 xl:px-3 xl:py-1.5 xl:text-xs">
      Enabled
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage-500 text-cream-50 xl:h-5 xl:w-5">
        <Check className="h-3 w-3 xl:h-3.5 xl:w-3.5" aria-hidden="true" />
      </span>
    </span>
  );
}

function EditButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="tap-target flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft transition-colors hover:bg-blossom-100 xl:h-auto xl:w-auto xl:bg-gold-50 xl:text-gold-500 xl:hover:bg-gold-100"
    >
      <Pencil className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
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
          className="tap-target inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-700 xl:text-base"
        >
          <ArrowLeft className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
          Back to My Account
        </Link>

        <div className="mt-3 xl:mt-3">
          <h1 className="font-display text-xl font-bold leading-tight text-ink-700 xs:text-2xl xl:text-4xl">
            Account Details <span className="text-blossom-400">♥</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-500 xl:mt-2 xl:text-lg xl:text-ink-400">
            Manage your profile and email preferences.
          </p>
        </div>

        <section className="mt-5 rounded-2xl bg-cream-50 p-4 shadow-clay-sm xs:p-5 xl:mt-3 xl:rounded-3xl xl:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.7fr)_auto] xl:items-center xl:gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft xl:h-14 xl:w-14 xl:bg-gold-50 xl:text-gold-500">
                <User className="h-5 w-5 xl:h-7 xl:w-7" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold text-ink-700 xl:text-lg">Profile</h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-500 xl:mt-1 xl:max-w-xs xl:text-sm xl:text-ink-400">
                  Basic details linked to your orders and account.
                </p>
              </div>
            </div>

            <div className="grid gap-3 xs:grid-cols-2 xl:grid-cols-2 xl:gap-4">
              <div>
                <p className="mb-1.5 text-xs font-bold text-ink-700 xl:mb-1.5 xl:text-sm">Name</p>
                <div className="flex min-h-11 items-center gap-2 rounded-xl border border-blossom-100 bg-cream-50 px-3 shadow-clay-pressed xl:min-h-11 xl:gap-3 xl:border-ink-100 xl:px-3.5">
                  <User className="h-4 w-4 shrink-0 text-blossom-500 xl:h-4 xl:w-4 xl:text-gold-400" aria-hidden="true" />
                  <span className="truncate text-xs font-medium text-ink-600 xl:text-sm">{name}</span>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-bold text-ink-700 xl:mb-1.5 xl:text-sm">Email</p>
                <div className="flex min-h-11 items-center gap-2 rounded-xl border border-blossom-100 bg-cream-50 px-3 shadow-clay-pressed xl:min-h-11 xl:gap-3 xl:border-ink-100 xl:px-3.5">
                  <Mail className="h-4 w-4 shrink-0 text-blossom-500 xl:h-4 xl:w-4 xl:text-gold-400" aria-hidden="true" />
                  <span className="truncate text-xs font-medium text-ink-600 xl:text-sm">{email}</span>
                </div>
              </div>
            </div>

            <div className="justify-self-end xl:justify-self-auto">
              <EditButton label="Edit profile details" />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-cream-50 p-4 shadow-clay-sm xs:p-5 xl:mt-3 xl:rounded-3xl xl:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.7fr)_auto] xl:items-center xl:gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft xl:h-14 xl:w-14 xl:bg-gold-50 xl:text-gold-500">
                <Mail className="h-5 w-5 xl:h-7 xl:w-7" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold text-ink-700 xl:text-lg">Sign-in Email</h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-500 xl:mt-1 xl:max-w-xs xl:text-sm xl:text-ink-400">
                  We use this email for magic-link login, receipts, and secure download access.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold text-ink-700 xl:hidden">Email</p>
              <div className="flex min-h-11 items-center gap-2 rounded-xl border border-blossom-100 bg-cream-50 px-3 shadow-clay-pressed xl:min-h-11 xl:gap-3 xl:border-ink-100 xl:px-3.5">
                <Mail className="h-4 w-4 shrink-0 text-blossom-500 xl:h-4 xl:w-4 xl:text-gold-400" aria-hidden="true" />
                <span className="truncate text-xs font-medium text-ink-600 xl:text-sm">{email}</span>
              </div>
            </div>

            <div className="justify-self-end xl:justify-self-auto">
              <EditButton label="Edit sign-in email" />
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 xs:grid-cols-2 xl:mt-3 xl:gap-3">
          <div className="rounded-2xl bg-cream-50 p-4 shadow-clay-sm xs:p-5 xl:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blossom-50 text-blossom-500 shadow-soft xl:h-14 xl:w-14">
                  <Bell className="h-5 w-5 xl:h-7 xl:w-7" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-bold text-ink-700 xl:text-lg">Order Updates</h2>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500 xl:mt-1 xl:text-sm xl:text-ink-400">
                    Purchase confirmations and download links are sent automatically.
                  </p>
                </div>
              </div>
              <EnabledBadge />
            </div>
            <div className="mt-4 border-t border-dashed border-ink-100 pt-3 xl:mt-3 xl:pt-3">
              <p className="flex flex-wrap items-start gap-1.5 text-xs font-medium leading-relaxed text-violet-600 xl:items-center xl:gap-2 xl:text-xs xl:text-ink-400">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blossom-500 xl:mt-0 xl:h-4 xl:w-4 xl:text-gold-500" aria-hidden="true" />
                You&apos;ll receive updates at
                <span className="break-all font-semibold text-violet-600 xl:text-gold-500">{email}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-cream-50 p-4 shadow-clay-sm xs:p-5 xl:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600 shadow-soft xl:h-14 xl:w-14">
                  <ShieldCheck className="h-5 w-5 xl:h-7 xl:w-7" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-bold text-ink-700 xl:text-lg">Secure Access</h2>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500 xl:mt-1 xl:text-sm xl:text-ink-400">
                    Downloads are safely attached to the email used at checkout.
                  </p>
                </div>
              </div>
              <EnabledBadge />
            </div>
            <div className="mt-4 border-t border-dashed border-ink-100 pt-3 xl:mt-3 xl:pt-3">
              <p className="flex items-start gap-1.5 text-xs font-semibold leading-relaxed text-violet-600 xl:items-center xl:gap-2 xl:text-xs xl:text-gold-500">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 xl:mt-0 xl:h-4 xl:w-4" aria-hidden="true" />
                Your account and downloads are protected
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-4 max-w-6xl overflow-hidden rounded-2xl border border-ink-100 bg-blossom-50/20 p-4 shadow-soft xs:p-5 xl:mt-3 xl:rounded-3xl xl:bg-gold-50/30 xl:px-6 xl:py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-50 text-blossom-600 shadow-soft xl:h-12 xl:w-12 xl:bg-gold-50 xl:text-gold-500">
              <ShieldCheck className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xs font-bold text-ink-700 xs:text-sm xl:text-base">Your data is safe with us</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-500 xl:mt-0.5 xl:text-sm">
                We never share your email. All your information is encrypted and secure.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
