import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "Add Category",
  robots: { index: false },
};

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Add Category
      </h1>
      <CategoryForm />
    </div>
  );
}
