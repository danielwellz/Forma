import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { salesRoles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  contactMethodLabelsFa,
  projectCategoryLabelsFa,
  requestScopeLabelsFa,
  requestTypeLabelsFa,
} from "@/lib/constants";
import { formatCurrencyToman, formatJalali, toFaDigits } from "@/lib/jalali";
import { EstimateForm } from "@/components/forms/estimate-form";
import { RequestMessageForm } from "@/components/forms/request-message-form";
import { RequestStatusForm } from "@/components/forms/request-status-form";
import { RequestFileList } from "@/components/shared/request-file-list";
import { RequestStatusBadge } from "@/components/shared/request-status-badge";
import { RequestStatusTimeline } from "@/components/shared/request-status-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(salesRoles, "/admin");

  const { id } = await params;

  const [request, assignees] = await Promise.all([
    prisma.request.findUnique({
      where: { id },
      include: {
        client: true,
        assignedTo: true,
        files: true,
        messages: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
        notes: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
        },
        estimate: true,
      },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN", "SALES"] },
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              {requestTypeLabelsFa[request.type]} - {request.client.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-stone-700">
            <div className="flex items-center gap-2">
              <RequestStatusBadge status={request.status} />
              <span>ثبت: {formatJalali(request.createdAt, true)}</span>
            </div>

            <RequestStatusTimeline status={request.status} />

            <div className="grid gap-2 md:grid-cols-2">
              <p>نوع پروژه: {projectCategoryLabelsFa[request.projectType]}</p>
              <p>شهر: {request.locationCityFa}</p>
              <p className="md:col-span-2">آدرس: {request.addressFa}</p>
              <p>متراژ: {request.areaSqm !== null && request.areaSqm !== undefined ? toFaDigits(request.areaSqm) : "-"}</p>
              <p>دامنه: {requestScopeLabelsFa[request.scope]}</p>
              <p>
                بودجه: {formatCurrencyToman(request.budgetMin)} تا {formatCurrencyToman(request.budgetMax)}
              </p>
              <p>روش تماس: {contactMethodLabelsFa[request.preferredContactMethod]}</p>
              <p className="md:col-span-2">توضیحات: {request.descriptionFa}</p>
              {request.meetingStartAt ? (
                <p className="md:col-span-2">
                  جلسه: {formatJalali(request.meetingStartAt, true)} تا {formatJalali(request.meetingEndAt, true)}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مدیریت وضعیت</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestStatusForm
              requestId={request.id}
              currentStatus={request.status}
              assignedToId={request.assignedToId}
              assignees={assignees}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ارسال برآورد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.estimate ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p>مبلغ: {formatCurrencyToman(Number(request.estimate.costAmount))}</p>
                <p>زمان: {request.estimate.timeEstimateText}</p>
                <p>ارسال: {formatJalali(request.estimate.sentAt, true)}</p>
              </div>
            ) : null}
            <EstimateForm requestId={request.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>فایل‌های پیوست</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <RequestFileList files={request.files} canDelete />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>گفتگو و پیام‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {request.messages.map((message) => (
            <div key={message.id} className="rounded-xl border border-stone-200 bg-white p-3">
              <p className="text-xs text-stone-500">
                {message.author.name} - {formatJalali(message.createdAt, true)}
              </p>
              <p className="mt-1 text-sm text-stone-700">{message.message}</p>
            </div>
          ))}
          <RequestMessageForm requestId={request.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تاریخچه داخلی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {request.notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm">
              <p className="text-xs text-stone-500">
                {note.author.name} - {formatJalali(note.createdAt, true)}
              </p>
              <p className="mt-1 text-stone-700">{note.note}</p>
            </div>
          ))}
          {request.notes.length === 0 ? <p className="text-sm text-stone-600">یادداشتی ثبت نشده است.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
