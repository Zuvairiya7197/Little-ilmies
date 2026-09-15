import type { Metadata } from "next";
import { getStorageUsageReport } from "@/lib/storage/usage-report";
import { isUsingBlobStorage } from "@/lib/storage";
import { StorageUsageGroups } from "@/components/admin/storage-usage-groups";

export const metadata: Metadata = {
  title: "Storage Usage",
  robots: { index: false },
};

const HOBBY_PLAN_LIMIT_BYTES = 1024 * 1024 * 1024; // 1GB

export default async function StorageUsagePage() {
  if (!isUsingBlobStorage()) {
    return (
      <div>
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Storage Usage</h1>
        <p className="mt-4 max-w-2xl text-sm text-ink-400">
          This environment is using local disk storage, not Vercel Blob, so there&apos;s no quota to report on
          here.
        </p>
      </div>
    );
  }

  const report = await getStorageUsageReport();
  const usedPercent = Math.min(100, (report.totalBytes / HOBBY_PLAN_LIMIT_BYTES) * 100);
  const totalOrphanedBytes = report.groups.reduce((sum, g) => sum + g.orphanedBytes, 0);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Storage Usage</h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-400">
        What&apos;s in Vercel Blob storage right now, grouped by type. Files with no product or category
        pointing at them are flagged as unused — safe to remove without affecting anything live.
      </p>

      <div className="card-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-2xl font-semibold text-ink-700">
            {formatBytes(report.totalBytes)} <span className="text-sm font-normal text-ink-300">used</span>
          </p>
          <p className="text-sm text-ink-400">{report.fileCount} files</p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className={`h-full rounded-full ${usedPercent >= 90 ? "bg-gold-500" : "bg-sage-500"}`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-300">
          {usedPercent.toFixed(1)}% of the Vercel Hobby plan&apos;s 1GB Blob storage limit
        </p>
        {totalOrphanedBytes > 0 && (
          <p className="mt-3 rounded-xl bg-gold-50 px-3 py-2 text-xs font-semibold text-gold-700">
            {formatBytes(totalOrphanedBytes)} is in unused files across all folders — removing those alone may
            be enough to get back under quota.
          </p>
        )}
      </div>

      <div className="mt-6">
        <StorageUsageGroups groups={report.groups} />
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
