import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toFaDigits } from "@/lib/jalali";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [projectCount, requestCount, newRequestCount, bookedCount] = await Promise.all([
    prisma.project.count(),
    prisma.request.count(),
    prisma.request.count({ where: { status: "NEW" } }),
    prisma.availabilitySlot.count({ where: { isBooked: true } }),
  ]);

  const cards = [
    { label: "پروژه‌ها", value: projectCount, href: "/admin/projects" },
    { label: "کل درخواست‌ها", value: requestCount, href: "/admin/requests" },
    { label: "درخواست جدید", value: newRequestCount, href: "/admin/requests?status=NEW" },
    { label: "جلسات رزرو شده", value: bookedCount, href: "/admin/availability" },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.label} href={card.href}>
          <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{toFaDigits(card.value.toLocaleString("fa-IR"))}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
