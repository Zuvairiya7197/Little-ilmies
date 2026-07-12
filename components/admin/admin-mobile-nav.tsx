"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-ink-100 bg-cream-50 px-4 py-3 lg:hidden">
        <span className="font-display text-base font-semibold text-ink-700">
          Little Ilmies <span className="text-ink-300">Admin</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="tap-target flex items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[80] bg-ink-500/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              className="fixed inset-y-0 left-0 z-[90] w-[80%] max-w-xs bg-cream-50 shadow-lifted lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close admin menu"
                  className="tap-target flex items-center justify-center rounded-full text-ink-400 hover:bg-ink-50"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div onClick={() => setOpen(false)}>
                <AdminSidebar />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
