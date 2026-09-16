import type { Metadata } from "next";
import { MigrateStorageRunner } from "@/components/admin/migrate-storage-runner";

export const metadata: Metadata = {
  title: "Migrate Storage",
  robots: { index: false },
};

export default function MigrateStoragePage() {
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Migrate Storage (one-time)
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-400">
        Copies every file from the old Vercel Blob store to Backblaze B2, server-to-server. Run a dry run
        first to see what would move, then the real migration. Nothing is deleted from Vercel Blob — this is
        safe to run more than once. Delete this page and its API route once you&apos;ve confirmed everything
        migrated.
      </p>
      <MigrateStorageRunner />
    </div>
  );
}
