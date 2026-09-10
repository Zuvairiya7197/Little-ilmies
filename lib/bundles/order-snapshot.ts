export type CustomBundleOrderSnapshot = {
  bundleId: string;
  bundleName: string;
  quantity: number;
  selectedBooks: { id: string; slug?: string; title: string; coverImage?: string }[];
};

export function parseCustomBundleSnapshot(value: unknown): CustomBundleOrderSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const snapshot = value as Partial<CustomBundleOrderSnapshot>;
  if (!snapshot.bundleId || !snapshot.bundleName || !Array.isArray(snapshot.selectedBooks)) return null;
  return {
    bundleId: snapshot.bundleId,
    bundleName: snapshot.bundleName,
    quantity: Number(snapshot.quantity) || snapshot.selectedBooks.length,
    selectedBooks: snapshot.selectedBooks.filter((book) => book?.id && book?.title),
  };
}
