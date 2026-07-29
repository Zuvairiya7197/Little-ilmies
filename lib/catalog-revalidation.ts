import { revalidatePath } from "next/cache";

export function revalidateCatalogPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop/[category]", "page");
  revalidatePath("/categories");
  revalidatePath("/collections");

  if (slug) {
    revalidatePath(`/product/${slug}`);
  }
}
