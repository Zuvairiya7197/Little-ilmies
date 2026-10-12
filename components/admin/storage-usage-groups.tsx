"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { StorageFileEntry, StorageUsageGroup } from "@/lib/storage/usage-report";

const GROUP_LABELS: Record<StorageUsageGroup["prefix"], string> = {
  pdfs: "Full book PDFs",
  previews: "Free preview pages",
  rentals: "Rent & Read pages",
  covers: "Cover images",
  other: "Other files",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function StorageUsageGroups({ groups }: { groups: StorageUsageGroup[] }) {
  if (groups.length === 0) {
    return <div className="card-surface p-8 text-center text-sm text-ink-300">No files in storage yet.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <StorageGroupCard key={group.prefix} group={group} />
      ))}
    </div>
  );
}

function StorageGroupCard({ group }: { group: StorageUsageGroup }) {
  const [showOrphans, setShowOrphans] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [removedPathnames, setRemovedPathnames] = useState<Set<string>>(new Set());

  const remainingOrphans = group.orphanedFiles.filter((f) => !removedPathnames.has(f.pathname));

  return (
    <div className="card-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-ink-700">{GROUP_LABELS[group.prefix]}</p>
          <p className="text-xs text-ink-400">
            {formatBytes(group.totalBytes)} · {group.fileCount} file{group.fileCount === 1 ? "" : "s"}
            {" · "}
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="font-semibold text-sage-700 hover:underline"
            >
              {showAll ? "Hide files" : "View all files"}
            </button>
          </p>
        </div>
        {remainingOrphans.length > 0 && (
          <button
            type="button"
            onClick={() => setShowOrphans((v) => !v)}
            className="rounded-full bg-gold-50 px-3 py-1.5 text-xs font-bold text-gold-700 hover:bg-gold-100"
          >
            {formatBytes(remainingOrphans.reduce((sum, f) => sum + f.size, 0))} unused in {remainingOrphans.length}{" "}
            file{remainingOrphans.length === 1 ? "" : "s"}
          </button>
        )}
      </div>

      {showOrphans && (
        <>
          {remainingOrphans.length > 1 && (
            <BulkDeleteButton
              files={remainingOrphans}
              onRemoved={(pathname) =>
                setRemovedPathnames((current) => new Set(current).add(pathname))
              }
            />
          )}
          <ul className="mt-3 divide-y divide-ink-100 border-t border-ink-100 pt-2">
            {remainingOrphans.map((file) => (
              <OrphanRow
                key={file.pathname}
                file={file}
                onRemoved={() =>
                  setRemovedPathnames((current) => new Set(current).add(file.pathname))
                }
              />
            ))}
          </ul>
        </>
      )}

      {showAll && (
        <ul className="mt-3 divide-y divide-ink-100 border-t border-ink-100 pt-2">
          {group.files
            .filter((file) => !removedPathnames.has(file.pathname))
            .map((file) =>
              file.usedBy.length === 0 ? (
                <OrphanRow
                  key={file.pathname}
                  file={file}
                  onRemoved={() => setRemovedPathnames((current) => new Set(current).add(file.pathname))}
                />
              ) : (
                <UsedFileRow key={file.pathname} file={file} />
              )
            )}
        </ul>
      )}
    </div>
  );
}

/** A file something still points at — shows who uses it, never a delete button. */
function UsedFileRow({ file }: { file: StorageFileEntry }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-1">
          {file.usedBy.map((use) => (
            <Link
              key={`${use.href}-${use.role}`}
              href={use.href}
              className="rounded-full bg-sage-50 px-2 py-0.5 text-[11px] font-semibold text-sage-700 hover:bg-sage-100"
            >
              {use.owner} · {use.role}
              {use.archived && " (archived)"}
            </Link>
          ))}
        </div>
        <p className="mt-1 truncate text-[11px] text-ink-300">
          {file.pathname} · {formatBytes(file.size)} · uploaded {new Date(file.uploadedAt).toLocaleDateString("en-US")}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-sage-500 px-2 py-0.5 text-[10px] font-bold uppercase text-cream-50">
        In use
      </span>
    </li>
  );
}

function BulkDeleteButton({
  files,
  onRemoved,
}: {
  files: { pathname: string; size: number }[];
  onRemoved: (pathname: string) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeAll() {
    if (
      !window.confirm(
        `Delete all ${files.length} unused files permanently? This can't be undone.\n\n` +
          `Each file is re-checked against live products right before deleting, so anything still in use will be skipped.`
      )
    ) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    let failedCount = 0;
    // Sequential, not parallel — this hits the same B2 bucket the rest of
    // the site's images/downloads are served from, so a burst of
    // concurrent deletes is avoided on principle even though deletes
    // aren't the download traffic that trips the bandwidth cap.
    for (const file of files) {
      try {
        const res = await fetch("/api/admin/storage/delete-orphan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathname: file.pathname }),
        });
        if (res.ok) {
          onRemoved(file.pathname);
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }
    setIsSubmitting(false);
    if (failedCount > 0) {
      setError(`${failedCount} file${failedCount === 1 ? "" : "s"} could not be deleted — still in use, or a network error.`);
    }
    router.refresh();
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={removeAll}
        disabled={isSubmitting}
        className="flex items-center gap-1.5 rounded-full bg-gold-600 px-3 py-1.5 text-xs font-bold text-cream-50 hover:bg-gold-700 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
        Delete all {files.length} unused files
      </button>
      {error && <p className="mt-1.5 text-xs font-semibold text-gold-700">{error}</p>}
    </div>
  );
}

function OrphanRow({
  file,
  onRemoved,
}: {
  file: { pathname: string; size: number; uploadedAt: string };
  onRemoved: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm(`Delete this unused file permanently?\n\n${file.pathname}`)) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/storage/delete-orphan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname: file.pathname }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Could not delete this file.");
        return;
      }
      onRemoved();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink-500">
          <span className="mr-1.5 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-700">
            Unused
          </span>
          {file.pathname}
        </p>
        <p className="text-[11px] text-ink-300">
          {formatBytes(file.size)} · uploaded {new Date(file.uploadedAt).toLocaleDateString("en-US")}
        </p>
        {error && <p className="mt-0.5 text-[11px] text-gold-700">{error}</p>}
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={isSubmitting}
        className="tap-target flex shrink-0 items-center gap-1 rounded-full p-1.5 text-ink-300 hover:bg-gold-50 hover:text-gold-700 disabled:opacity-50"
        aria-label={`Delete ${file.pathname}`}
      >
        {isSubmitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </li>
  );
}
