import type { Metadata } from "next";
import { BuyerLoginForm } from "@/components/store/buyer-login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Little Ilmies to access your purchase history and downloads.",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-12">
      <div className="card-surface w-full max-w-sm p-6 xs:p-8">
        <BuyerLoginForm />
      </div>
    </div>
  );
}
