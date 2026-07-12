import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getDownloadsForUser } from "@/lib/db/orders";
import { DownloadCard } from "@/components/account/download-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Downloads",
  robots: { index: false },
};

export default async function DownloadsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const downloads = await getDownloadsForUser(userId);

  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Downloads
      </h1>
      <p className="mt-1 text-sm text-ink-400">Your purchased e-books, ready anytime.</p>

      {downloads.length === 0 ? (
        <EmptyState
          icon={Download}
          title="No downloads yet"
          description="Books you purchase will appear here as secure downloads."
          action={
            <Link href="/shop" className="btn-primary">
              Browse Books
            </Link>
          }
        />
      ) : (
        <div className="mt-6 flex flex-col gap-4 xs:mt-8">
          {downloads.map((download) => (
            <DownloadCard key={`${download.orderId}-${download.productId}`} download={download} />
          ))}
        </div>
      )}
    </div>
  );
}
