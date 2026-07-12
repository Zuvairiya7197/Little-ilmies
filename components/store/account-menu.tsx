"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Receipt, Download, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (status !== "authenticated" || !session?.user) {
    return (
      <Link
        href="/login"
        aria-label="Login"
        className="tap-target hidden items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-50 sm:flex"
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="tap-target flex items-center justify-center rounded-full bg-sage-50 text-sage-700 transition-colors hover:bg-sage-100"
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-100 bg-cream-50 py-1.5 shadow-lifted"
        >
          <p className="truncate border-b border-ink-100 px-4 py-2.5 text-xs text-ink-300">
            {session.user.email}
          </p>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="tap-target flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
          >
            <User className="h-4 w-4 text-ink-300" aria-hidden="true" />
            My Account
          </Link>
          <Link
            href="/account/purchase-history"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="tap-target flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
          >
            <Receipt className="h-4 w-4 text-ink-300" aria-hidden="true" />
            Purchase History
          </Link>
          <Link
            href="/account/downloads"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="tap-target flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
          >
            <Download className="h-4 w-4 text-ink-300" aria-hidden="true" />
            Downloads
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="tap-target flex w-full items-center gap-2.5 border-t border-ink-100 px-4 py-2.5 text-left text-sm text-gold-700 hover:bg-gold-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
