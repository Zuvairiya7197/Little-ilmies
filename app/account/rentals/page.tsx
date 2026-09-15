import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, ShoppingBag } from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getRentalsForUser } from "@/lib/db/orders";

export const metadata: Metadata = {
  title: "Rentals",
  robots: { index: false },
};

export default async function RentalsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const rentals = await getRentalsForUser(session.user.id);

  return (
    <div className="container-content min-h-[calc(100vh-8rem)] pb-32 pt-8">
      <Link href="/account" className="tap-target inline-flex items-center gap-2 text-sm font-bold text-ink-500">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Account
      </Link>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-700">Rent & Read</h1>
          <p className="mt-2 text-sm font-medium text-ink-400">Your temporary online reading access.</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-700 shadow-soft">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </span>
      </div>

      {rentals.length === 0 ? (
        <section className="mt-8 rounded-3xl bg-cream-50 p-8 text-center shadow-clay-sm">
          <h2 className="font-display text-2xl font-bold text-ink-700">No rentals yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            Rent & Read is available for eligible customers in India on individual book pages.
          </p>
          <Link href="/shop" className="btn-primary mt-6">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Browse Books
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-4">
          {rentals.map((rental) => {
            const expiresAt = new Date(rental.expiresAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <article key={`${rental.orderId}-${rental.productId}`} className="flex gap-4 rounded-3xl bg-cream-50 p-4 shadow-clay-sm">
                <Link href={`/product/${rental.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                  <Image src={rental.coverImage} alt="" fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${rental.slug}`} className="line-clamp-2 font-display text-lg font-bold text-ink-700">
                      {rental.title}
                    </Link>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink-400">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {rental.isActive ? `Expires ${expiresAt}` : `Expired ${expiresAt}`}
                    </p>
                  </div>
                  {rental.isActive ? (
                    <Link href={`/read/${rental.productId}`} className="btn-primary mt-4 w-fit">
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      Read online
                    </Link>
                  ) : (
                    <span className="mt-4 w-fit rounded-full bg-ink-50 px-4 py-2 text-xs font-bold text-ink-400">
                      Rental expired
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
