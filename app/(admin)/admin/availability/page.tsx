import { AvailabilityForm } from "@/components/forms/availability-form";
import { DeleteSlotButton } from "@/components/forms/delete-slot-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { formatJalali } from "@/lib/jalali";
import { salesRoles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function AdminAvailabilityPage() {
  await requireRole(salesRoles, "/admin");

  const slots = await prisma.availabilitySlot.findMany({
    orderBy: { startAt: "asc" },
    take: 120,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>افزودن زمان مشاوره (تکی یا هفتگی)</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست اسلات‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 text-sm"
            >
              <div>
                {formatJalali(slot.startAt, true)} تا {formatJalali(slot.endAt, true)}
              </div>
              <div className="flex items-center gap-2">
                <span className={slot.isBooked ? "text-amber-700" : "text-emerald-700"}>{slot.isBooked ? "رزرو شده" : "آزاد"}</span>
                <DeleteSlotButton id={slot.id} disabled={slot.isBooked} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
