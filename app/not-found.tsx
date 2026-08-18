import { ArrowLeft, Home } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export default function NotFound() {
  return (
    <ErrorScreen
      eyebrow="404"
      title="This page could not be found."
      description="The page you're looking for doesn't exist or has been moved. Let's get you back to something useful."
      image="/images/404 page.png"
      imageAlt="Sad open book illustration"
      actions={[
        { href: "/", label: "Go to Home", icon: Home },
        { href: "/shop", label: "Browse Books", icon: ArrowLeft, variant: "plain" },
      ]}
    />
  );
}
