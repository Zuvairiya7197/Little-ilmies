import type { Metadata } from "next";
import { ArrowLeft, Download, LifeBuoy } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export const metadata: Metadata = {
  title: "Download Error",
  robots: { index: false },
};

export default function DownloadErrorPage() {
  return (
    <ErrorScreen
      eyebrow="Download issue"
      title="We couldn't prepare your download."
      description="Your purchase is still safe. Please try again from your downloads page, or contact support if the file still doesn't open."
      image="/images/no download yet.png"
      imageAlt="Download illustration"
      actions={[
        { href: "/account/downloads", label: "View Downloads", icon: Download },
        { href: "/contact", label: "Contact Support", icon: LifeBuoy, variant: "secondary" },
        { href: "/account", label: "Back to Account", icon: ArrowLeft, variant: "plain" },
      ]}
    />
  );
}
