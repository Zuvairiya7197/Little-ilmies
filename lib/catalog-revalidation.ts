import { revalidatePath } from "next/cache";

/** Public pages are cached for a day and every one of them shows catalog
 * data (at least the categories in the header), so any admin change clears
 * them all at once. */
export function revalidateCatalogPaths() {
  revalidatePath("/", "layout");
}
