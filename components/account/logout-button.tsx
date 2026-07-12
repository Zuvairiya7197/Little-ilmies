"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "tap-target flex w-full items-center justify-center gap-2 rounded-full border border-ink-100 py-3 text-sm font-semibold text-ink-500 transition-colors hover:border-gold-300 hover:bg-gold-50"
      }
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Logout
    </button>
  );
}
