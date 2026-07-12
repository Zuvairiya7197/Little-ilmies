"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Receipt,
  Users,
  Ticket,
  Download,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/buyers", label: "Buyers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex h-full flex-col gap-1 p-4">
      <Link href="/admin" className="mb-4 flex items-center gap-2 px-2 py-2">
        <span className="font-display text-lg font-semibold text-ink-700">Little Ilmies</span>
        <span className="rounded-full bg-ink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cream-50">
          Admin
        </span>
      </Link>

      {navItems.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "tap-target flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-ink-500 text-cream-50" : "text-ink-500 hover:bg-ink-50"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto flex flex-col gap-1 border-t border-ink-100 pt-4">
        <Link
          href="/"
          className="tap-target flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-400 hover:bg-ink-50"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          View storefront
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="tap-target flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gold-700 hover:bg-gold-50"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>
    </nav>
  );
}
