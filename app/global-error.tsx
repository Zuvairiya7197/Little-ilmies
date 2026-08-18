"use client";

import { Home, LifeBuoy, RotateCcw } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorScreen
          eyebrow="Site error"
          title="Little Ilmies needs a quick refresh."
          description="A serious page error interrupted the site. Try refreshing once, or contact support if this keeps showing."
          image="/images/contact support.png"
          imageAlt="Customer support illustration"
          actions={[
            { label: "Refresh Page", icon: RotateCcw, onClick: reset },
            { href: "/contact", label: "Contact Support", icon: LifeBuoy, variant: "secondary" },
            { href: "/", label: "Go to Home", icon: Home, variant: "plain" },
          ]}
        />
      </body>
    </html>
  );
}
