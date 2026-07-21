import type { Metadata } from "next";
import { CollectionsView } from "@/components/store/collections-view";

export const metadata: Metadata = {
  title: "Featured Collections",
  description:
    "Explore handpicked e-books and activities that inspire faith, build character, and make learning delightful.",
  alternates: {
    canonical: "/collections",
  },
};

export default function CollectionsPage() {
  return <CollectionsView />;
}
