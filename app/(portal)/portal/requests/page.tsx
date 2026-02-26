import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guards";
import { requestTypeLabelsFa } from "@/lib/constants";
import { formatJalali } from "@/lib/jalali";
import { RequestStatusBadge } from "@/components/shared/request-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PortalRequestsPage() {
  const user = await requireAuth();

  const requests = await prisma.request.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست درخواست‌ها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <Link
            key={request.id}
            href={`/portal/requests/${request.id}`}
            className="grid gap-1 rounded-xl border border-stone-200 bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{requestTypeLabelsFa[request.type]}</p>
              <RequestStatusBadge status={request.status} />
            </div>
            <p className="text-xs text-stone-500">{formatJalali(request.createdAt, true)}</p>
          </Link>
        ))}
        {requests.length === 0 ? <p className="text-sm text-stone-600">موردی یافت نشد.</p> : null}
      </CardContent>
    </Card>
  );
}
