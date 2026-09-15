import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/db/prisma";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export const metadata: Metadata = {
  title: "Rent & Read",
  robots: { index: false },
};

export default async function RentalReaderPage({ params }: PageProps) {
  const { productId } = await params;
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const rental = await prisma.rentalAccess.findFirst({
    where: {
      productId,
      rentalExpiresAt: { gt: new Date() },
      order: { userId: session.user.id, status: "PAID" },
    },
    include: { product: true },
    orderBy: { rentalExpiresAt: "desc" },
  });

  if (!rental) notFound();

  const expiresAt = rental.rentalExpiresAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="min-h-screen bg-ink-700">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream-50 px-4 py-3 shadow-soft">
        <Link href="/account/rentals" className="tap-target inline-flex items-center gap-2 text-sm font-bold text-ink-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          My rentals
        </Link>
        <div className="min-w-0 text-center">
          <h1 className="line-clamp-1 font-display text-lg font-bold text-ink-700">{rental.product.title}</h1>
          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Access until {expiresAt}
          </p>
        </div>
        <span className="hidden w-24 lg:block" aria-hidden="true" />
      </div>

      <iframe
        src={`/api/rentals/${productId}/read#toolbar=0&navpanes=0`}
        title={`Read ${rental.product.title}`}
        className="h-[calc(100vh-4.5rem)] w-full border-0 bg-cream-50"
      />
    </main>
  );
}
