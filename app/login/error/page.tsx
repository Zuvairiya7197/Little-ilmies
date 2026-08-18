import type { Metadata } from "next";
import { Mail, RotateCcw, ShoppingBag } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export const metadata: Metadata = {
  title: "Login Link Expired",
  robots: { index: false },
};

export default function LoginErrorPage() {
  return (
    <ErrorScreen
      eyebrow="Login link expired"
      title="That sign-in link no longer works."
      description="Magic links can expire or be used only once. Request a fresh link and use the newest email in your inbox."
      image="/images/check your email.png"
      imageAlt="Email illustration"
      actions={[
        { href: "/login", label: "Send New Link", icon: Mail },
        { href: "/shop", label: "Browse Books", icon: ShoppingBag, variant: "secondary" },
        { href: "/login", label: "Back to Login", icon: RotateCcw, variant: "plain" },
      ]}
    />
  );
}
