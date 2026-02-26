import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireAuth } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <DashboardLayout
      title="پرتال کارفرما"
      nav={[
        { href: "/portal", label: "داشبورد" },
        { href: "/portal/requests", label: "درخواست‌ها" },
        { href: "/portal/requests/new", label: "درخواست جدید" },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
