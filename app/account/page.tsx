import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Receipt, Download, Heart, ShoppingBag, User } from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getOrdersForUser } from "@/lib/db/orders";
import { AccountNavCard } from "@/components/account/account-nav-card";
import { LogoutButton } from "@/components/account/logout-button";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const orders = await getOrdersForUser(userId);

  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        My Account
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Signed in as <strong>{session.user.email}</strong>
      </p>

      <div className="mt-6 flex flex-col gap-3 xs:mt-8">
        <AccountNavCard
          href="/account/purchase-history"
          icon={Receipt}
          title="Purchase History"
          description="View your past orders and receipts"
          badge={orders.length || undefined}
        />
        <AccountNavCard
          href="/account/downloads"
          icon={Download}
          title="Downloads"
          description="Access your purchased e-books"
        />
        <AccountNavCard
          href="/wishlist"
          icon={Heart}
          title="Wishlist"
          description="Books you've saved for later"
        />
        <AccountNavCard
          href="/cart"
          icon={ShoppingBag}
          title="Saved Cart"
          description="Continue where you left off"
        />
        <AccountNavCard
          href="/account/details"
          icon={User}
          title="Account Details"
          description="Name, email, and preferences"
        />
      </div>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
