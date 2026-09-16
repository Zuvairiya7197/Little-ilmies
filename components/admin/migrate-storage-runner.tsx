"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface MigrationResult {
  dryRun: boolean;
  totalListed: number;
  migratedCount: number;
  failedCount: number;
  migrated: { pathname: string; size: number }[];
  failed: { pathname: string; error: string }[];
}

export function MigrateStorageRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(dryRun: boolean) {
    if (!dryRun && !window.confirm("Run the real migration now? This copies every file from Vercel Blob to B2.")) {
      return;
    }
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/migrate-storage?dryRun=${dryRun}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Migration request failed.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while running the migration.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run(true)}
          disabled={isRunning}
          className="btn-secondary disabled:opacity-50"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Dry Run (list only, no copying)
        </button>
        <button
          type="button"
          onClick={() => run(false)}
          disabled={isRunning}
          className="btn-primary disabled:opacity-50"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Run Real Migration
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">{error}</p>
      )}

      {result && (
        <div className="card-surface p-5">
          <p className="font-display text-lg font-semibold text-ink-700">
            {result.dryRun ? "Dry run" : "Migration"} complete
          </p>
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-ink-300">Listed in Blob</p>
              <p className="font-display text-xl font-semibold text-ink-700">{result.totalListed}</p>
            </div>
            <div>
              <p className="text-ink-300">{result.dryRun ? "Would migrate" : "Migrated"}</p>
              <p className="font-display text-xl font-semibold text-sage-700">{result.migratedCount}</p>
            </div>
            <div>
              <p className="text-ink-300">Failed</p>
              <p className="font-display text-xl font-semibold text-gold-700">{result.failedCount}</p>
            </div>
          </div>

          {result.failed.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gold-700">Failed files:</p>
              <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-gold-50 p-3 text-xs text-gold-700">
                {result.failed.map((f) => (
                  <li key={f.pathname}>
                    {f.pathname} — {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!result.dryRun && result.migrated.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink-600">Migrated files ({result.migrated.length}):</p>
              <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-cream-50 p-3 text-xs text-ink-500">
                {result.migrated.map((f) => (
                  <li key={f.pathname}>{f.pathname}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
