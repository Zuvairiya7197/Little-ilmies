import type { Metadata } from "next";
import { Home, LifeBuoy, RefreshCw } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false },
};

export default function MaintenancePage() {
  return (
    <ErrorScreen
      eyebrow="Maintenance"
      title="We're making Little Ilmies better."
      description="The store may be briefly unavailable while updates are being completed. Please check again in a few minutes."
      image="/images/contact support.png"
      imageAlt="Support illustration"
      actions={[
        { href: "/", label: "Try Home", icon: RefreshCw },
        { href: "/contact", label: "Contact Support", icon: LifeBuoy, variant: "secondary" },
        { href: "/", label: "Go to Home", icon: Home, variant: "plain" },
      ]}
    />
  );
}
