import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <AdminMobileNav />
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-cream-50 lg:block">
        <div className="sticky top-0">
          <AdminSidebar />
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-beige-light px-4 py-6 xs:px-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
