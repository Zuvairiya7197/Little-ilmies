"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Package,
  Receipt,
  Users,
  Ticket,
  Download,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Each section gets its own accent from the brand's rainbow palette —
// same colors already used for the product form's section borders — so
// the sidebar reads as a set of distinct areas rather than one block.
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, color: "ink" },
  { href: "/admin/products", label: "Products", icon: BookOpen, color: "sage" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, color: "gold" },
  { href: "/admin/bundles", label: "Bundles", icon: Package, color: "teal" },
  { href: "/admin/orders", label: "Orders", icon: Receipt, color: "blossom" },
  { href: "/admin/buyers", label: "Buyers", icon: Users, color: "sunny" },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, color: "lemon" },
  { href: "/admin/downloads", label: "Downloads", icon: Download, color: "sage" },
  { href: "/admin/settings", label: "Settings", icon: Settings, color: "ink" },
] as const;

// Static class lookup (never string-interpolated) so Tailwind's compiler
// can see every class name used.
const navColorClasses: Record<(typeof navItems)[number]["color"], { active: string; icon: string }> = {
  ink: { active: "bg-ink-500 text-cream-50", icon: "text-ink-500" },
  sage: { active: "bg-sage-500 text-cream-50", icon: "text-sage-600" },
  gold: { active: "bg-gold-500 text-cream-50", icon: "text-gold-600" },
  teal: { active: "bg-teal-500 text-cream-50", icon: "text-teal-600" },
  blossom: { active: "bg-blossom-500 text-cream-50", icon: "text-blossom-600" },
  sunny: { active: "bg-sunny-500 text-cream-50", icon: "text-sunny-700" },
  lemon: { active: "bg-lemon-500 text-ink-700", icon: "text-lemon-700" },
};

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
        const colors = navColorClasses[item.color];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "tap-target flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? colors.active : "text-ink-500 hover:bg-ink-50"
            )}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", !isActive && colors.icon)} aria-hidden="true" />
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
