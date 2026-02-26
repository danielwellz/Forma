import Link from "next/link";
import { ProjectCategory, RequestStatus, RequestType } from "@prisma/client";
import { requireRole } from "@/lib/auth-guards";
import { salesRoles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { projectCategoryLabelsFa, requestStatusLabelsFa, requestTypeLabelsFa } from "@/lib/constants";
import { formatJalali } from "@/lib/jalali";
import { RequestStatusBadge } from "@/components/shared/request-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(salesRoles, "/admin");

  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as RequestStatus) : undefined;
  const type = typeof params.type === "string" ? (params.type as RequestType) : undefined;
  const category = typeof params.category === "string" ? (params.category as ProjectCategory) : undefined;
  const from = typeof params.from === "string" ? new Date(params.from) : undefined;
  const to = typeof params.to === "string" ? new Date(params.to) : undefined;

  const requests = await prisma.request.findMany({
    where: {
      status,
      type,
      projectType: category,
      createdAt:
        from || to
          ? {
              gte: from && !Number.isNaN(from.getTime()) ? from : undefined,
              lte: to && !Number.isNaN(to.getTime()) ? new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1) : undefined,
            }
          : undefined,
    },
    include: {
      client: true,
      assignedTo: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدیریت سرنخ‌ها و درخواست‌ها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 md:grid-cols-6">
          <Select name="status" defaultValue={status ?? ""}>
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(requestStatusLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="type" defaultValue={type ?? ""}>
            <option value="">همه نوع‌ها</option>
            {Object.entries(requestTypeLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={category ?? ""}>
            <option value="">همه دسته‌ها</option>
            {Object.entries(projectCategoryLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <input
            type="date"
            name="from"
            defaultValue={typeof params.from === "string" ? params.from : ""}
            className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm"
          />
          <input
            type="date"
            name="to"
            defaultValue={typeof params.to === "string" ? params.to : ""}
            className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm"
          />
          <button className="h-10 rounded-xl bg-forma-700 px-3 text-sm text-white hover:bg-forma-800">اعمال</button>
        </form>

        <div className="space-y-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/requests/${request.id}`}
              className="block rounded-xl border border-stone-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-stone-900">
                  {requestTypeLabelsFa[request.type]} - {request.client.name}
                </p>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-600">
                <span>دسته: {projectCategoryLabelsFa[request.projectType]}</span>
                <span>ثبت: {formatJalali(request.createdAt, true)}</span>
                <span>مسئول: {request.assignedTo?.name ?? "-"}</span>
              </div>
            </Link>
          ))}
          {requests.length === 0 ? <p className="text-sm text-stone-600">درخواستی یافت نشد.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
