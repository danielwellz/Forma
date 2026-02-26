import { notFound } from "next/navigation";
import { RequestStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth-guards";
import {
  contactMethodLabelsFa,
  projectCategoryLabelsFa,
  requestScopeLabelsFa,
  requestStatusLabelsFa,
  requestTypeLabelsFa,
} from "@/lib/constants";
import { formatCurrencyToman, formatJalali, toFaDigits } from "@/lib/jalali";
import { prisma } from "@/lib/prisma";
import { RequestFileAppendForm } from "@/components/forms/request-file-append-form";
import { RequestMessageForm } from "@/components/forms/request-message-form";
import { RequestFileList } from "@/components/shared/request-file-list";
import { RequestStatusBadge } from "@/components/shared/request-status-badge";
import { RequestStatusTimeline } from "@/components/shared/request-status-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PortalRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      files: true,
      messages: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
      estimate: true,
    },
  });

  if (!request || request.clientId !== user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{requestTypeLabelsFa[request.type]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-stone-700">
          <div className="flex flex-wrap items-center gap-3">
            <RequestStatusBadge status={request.status} />
            <span>ثبت: {formatJalali(request.createdAt, true)}</span>
            <span>آخرین تغییر: {formatJalali(request.updatedAt, true)}</span>
          </div>
          <RequestStatusTimeline status={request.status} />
          <p>وضعیت فعلی: {requestStatusLabelsFa[request.status]}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>جزئیات درخواست</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-stone-700 md:grid-cols-2">
          <p>
            <span className="font-medium">نوع پروژه:</span> {projectCategoryLabelsFa[request.projectType]}
          </p>
          <p>
            <span className="font-medium">شهر:</span> {request.locationCityFa}
          </p>
          <p className="md:col-span-2">
            <span className="font-medium">آدرس:</span> {request.addressFa}
          </p>
          <p>
            <span className="font-medium">متراژ:</span> {request.areaSqm ? `${toFaDigits(request.areaSqm)} مترمربع` : "-"}
          </p>
          <p>
            <span className="font-medium">دامنه خدمات:</span> {requestScopeLabelsFa[request.scope]}
          </p>
          <p>
            <span className="font-medium">بودجه:</span> {formatCurrencyToman(request.budgetMin)} تا {formatCurrencyToman(request.budgetMax)}
          </p>
          <p>
            <span className="font-medium">روش تماس:</span> {contactMethodLabelsFa[request.preferredContactMethod]}
          </p>
          {request.meetingStartAt ? (
            <p className="md:col-span-2">
              <span className="font-medium">زمان جلسه:</span> {formatJalali(request.meetingStartAt, true)} تا {formatJalali(request.meetingEndAt, true)}
            </p>
          ) : null}
          <p className="md:col-span-2">
            <span className="font-medium">توضیحات:</span> {request.descriptionFa}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>فایل‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <RequestFileList files={request.files} canDelete={request.status === RequestStatus.NEEDS_INFO} />
          {request.status === RequestStatus.NEEDS_INFO ? <RequestFileAppendForm requestId={request.id} /> : null}
        </CardContent>
      </Card>

      {request.estimate ? (
        <Card>
          <CardHeader>
            <CardTitle>برآورد ارسال‌شده</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-stone-700">
            <p>مبلغ: {formatCurrencyToman(Number(request.estimate.costAmount))}</p>
            <p>زمان: {request.estimate.timeEstimateText}</p>
            <p>مراحل بعدی: {request.estimate.nextStepsFa}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>پیام‌ها</CardTitle>
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
          {request.status === RequestStatus.NEEDS_INFO ? <RequestMessageForm requestId={request.id} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
