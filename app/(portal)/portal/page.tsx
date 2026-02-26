import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guards";
import { requestTypeLabelsFa } from "@/lib/constants";
import { formatJalali } from "@/lib/jalali";
import { RequestStatusBadge } from "@/components/shared/request-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PortalHomePage() {
  const user = await requireAuth();

  const requests = await prisma.request.findMany({
    where: { clientId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>داشبورد کارفرما</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-stone-700">
          <p>خوش آمدید {user.name ?? ""}. اینجا می‌توانید وضعیت درخواست‌ها را پیگیری کنید.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/portal/requests/new?type=ESTIMATE">درخواست برآورد جدید</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/portal/requests/new?type=CONSULTATION">درخواست مشاوره جدید</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>آخرین درخواست‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/portal/requests/${request.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
            >
              <div className="text-sm">
                <p className="font-medium text-stone-900">{requestTypeLabelsFa[request.type]}</p>
                <p className="text-xs text-stone-500">آخرین بروزرسانی: {formatJalali(request.updatedAt, true)}</p>
              </div>
              <RequestStatusBadge status={request.status} />
            </Link>
          ))}
          {requests.length === 0 ? <p className="text-sm text-stone-600">هنوز درخواستی ثبت نشده است.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
