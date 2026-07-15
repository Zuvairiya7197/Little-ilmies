import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  const session = await getAdminSession();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Settings
      </h1>
      <p className="mb-6 text-sm text-ink-400">
        Signed in as {session?.user?.email}
      </p>

      <div className="max-w-md">
        <h2 className="mb-3 font-display text-base font-semibold text-ink-600">
          Change password
        </h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
