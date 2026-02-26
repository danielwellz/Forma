import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireRole } from "@/lib/auth-guards";
import { adminRoles } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(adminRoles, "/portal");

  return (
    <DashboardLayout
      title="پنل مدیریت"
      nav={[
        { href: "/admin", label: "نمای کلی" },
        { href: "/admin/content", label: "محتوا" },
        { href: "/admin/projects", label: "پروژه‌ها" },
        { href: "/admin/requests", label: "درخواست‌ها" },
        { href: "/admin/availability", label: "زمان‌های مشاوره" },
        { href: "/admin/users", label: "کاربران" },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
