import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div data-admin className="container-content flex min-h-[70vh] items-center justify-center py-12">
      <div className="card-surface w-full max-w-sm p-6 xs:p-8">
        <AdminLoginForm />
      </div>
    </div>
  );
}
