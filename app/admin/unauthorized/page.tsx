import type { Metadata } from "next";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export const metadata: Metadata = {
  title: "Admin Access Required",
  robots: { index: false },
};

export default function AdminUnauthorizedPage() {
  return (
    <ErrorScreen
      eyebrow="Admin only"
      title="You don't have access to this area."
      description="This dashboard is only available to Little Ilmies admins. Sign in with an admin account or contact the site owner."
      icon={LockKeyhole}
      actions={[
        { href: "/admin/login", label: "Admin Login", icon: LockKeyhole },
        { href: "/contact", label: "Contact Support", icon: Mail, variant: "secondary" },
        { href: "/", label: "Back to Store", icon: ArrowLeft, variant: "plain" },
      ]}
      compact
    />
  );
}
