"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, X, User, LogOut } from "lucide-react";
import { booksMenuSections, shopNavLinks } from "@/lib/store-navigation";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session, status } = useSession();
  const [openSections, setOpenSections] = useState<string[]>(["Islamic Studies"]);

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
                <li>
                  <div className="rounded-2xl bg-cream-100 p-2">
                    <p className="px-2 pb-1 pt-1 font-display text-base font-bold text-ink-700">Books</p>
                    <div className="flex flex-col gap-1">
                      {booksMenuSections.map((section) => {
                        const expanded = openSections.includes(section.title);
                        return (
                          <div key={section.title} className="rounded-xl bg-cream-50">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenSections((current) =>
                                  expanded
                                    ? current.filter((title) => title !== section.title)
                                    : [...current, section.title]
                                )
                              }
                              aria-expanded={expanded}
                              className="tap-target flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold text-ink-600"
                            >
                              {section.title}
                              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                            </button>
                            <AnimatePresence initial={false}>
                              {expanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex flex-col gap-1 px-3 pb-3">
                                    <Link
                                      href={section.href}
                                      onClick={onClose}
                                      className="rounded-lg bg-sage-50 px-3 py-2 text-sm font-semibold text-sage-700"
                                    >
                                      View all {section.title}
                                    </Link>
                                    {section.links.map((link) => (
                                      <Link
                                        key={`${section.title}-${link.label}`}
                                        href={link.href}
                                        onClick={onClose}
                                        className="rounded-lg px-3 py-2 text-sm text-ink-500 transition-colors hover:bg-cream-100 hover:text-ink-700"
                                      >
                                        {link.label}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </li>

                {shopNavLinks.map((item) => (
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
              <Link href="/wishlist" onClick={onClose} className="btn-secondary w-full">
                <Heart className="h-4 w-4" aria-hidden="true" />
                Wishlist
              </Link>
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
