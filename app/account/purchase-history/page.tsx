import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getOrdersForUser } from "@/lib/db/orders";
import { OrderCard } from "@/components/account/order-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Purchase History",
  robots: { index: false },
};

export default async function PurchaseHistoryPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const orders = await getOrdersForUser(userId);

  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Purchase History
      </h1>
      <p className="mt-1 text-sm text-ink-400">Orders linked to {session.user.email}</p>

      {orders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No purchases yet"
          description="Once you buy a book, your orders and receipts will show up here."
          action={
            <Link href="/shop" className="btn-primary">
              Browse Books
            </Link>
          }
        />
      ) : (
        <div className="mt-6 flex flex-col gap-4 xs:mt-8">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
