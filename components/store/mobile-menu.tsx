"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, LogOut } from "lucide-react";
import { primaryNav } from "@/lib/nav";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink-500/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-y-0 left-0 z-[90] flex w-[85%] max-w-sm flex-col bg-cream-50 shadow-lifted md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <span className="font-display text-lg font-semibold text-ink-600">
                Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="tap-target flex items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-600"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="tap-target flex items-center rounded-xl px-3 py-3 text-base font-medium text-ink-500 transition-colors hover:bg-sage-50 hover:text-ink-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="safe-bottom flex flex-col gap-2 border-t border-ink-100 p-5">
              {status === "authenticated" && session?.user ? (
                <>
                  <Link href="/account" onClick={onClose} className="btn-secondary w-full">
                    <User className="h-4 w-4" aria-hidden="true" />
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="tap-target flex w-full items-center justify-center gap-2 rounded-full border border-ink-100 py-3 text-sm font-semibold text-gold-700 transition-colors hover:bg-gold-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={onClose} className="btn-secondary w-full">
                  <User className="h-4 w-4" aria-hidden="true" />
                  Login / Account
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
