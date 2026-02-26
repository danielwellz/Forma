import { NextResponse } from "next/server";
import { RequestStatus } from "@prisma/client";
import { getServerAuthSession } from "@/lib/auth";
import { formatJalali } from "@/lib/jalali";
import { checkRateLimit, getRequestIp, shouldEnforceRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { requestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (shouldEnforceRateLimit()) {
    const ip = getRequestIp(request);
    const limit = checkRateLimit(`request:${session.user.id}:${ip}`, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json({ error: "تعداد درخواست زیاد است. لطفاً چند دقیقه دیگر تلاش کنید." }, { status: 429 });
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" }, { status: 400 });
  }

  const data = parsed.data;
  const requestPrefix = `requests/${session.user.id}/`;

  if (data.uploadedFiles?.some((file) => !file.objectKey.startsWith(requestPrefix))) {
    return NextResponse.json({ error: "کلید فایل معتبر نیست." }, { status: 400 });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      let meetingStartAt: Date | undefined;
      let meetingEndAt: Date | undefined;
      let status: RequestStatus = "NEW";

      if (data.type === "CONSULTATION" && data.availabilitySlotId) {
        const slot = await tx.availabilitySlot.findUnique({ where: { id: data.availabilitySlotId } });

        if (!slot || slot.isBooked || slot.startAt < new Date()) {
          throw new Error("SLOT_UNAVAILABLE");
        }

        meetingStartAt = slot.startAt;
        meetingEndAt = slot.endAt;
        status = "MEETING_SCHEDULED";
      }

      const createdRequest = await tx.request.create({
        data: {
          type: data.type,
          status,
          clientId: session.user.id,
          projectType: data.projectType,
          locationCityFa: data.locationCityFa,
          addressFa: data.addressFa,
          mapPinLat: data.mapPinLat,
          mapPinLng: data.mapPinLng,
          areaSqm: data.areaSqm,
          scope: data.scope,
          budgetMin: data.budgetMin,
          budgetMax: data.budgetMax,
          budgetRangeText: data.budgetRangeText,
          timelineTarget: data.timelineTarget,
          descriptionFa: data.descriptionFa,
          preferredContactMethod: data.preferredContactMethod,
          meetingStartAt,
          meetingEndAt,
          sourceProjectId: data.sourceProjectId,
          files: data.uploadedFiles?.length
            ? {
                createMany: {
                  data: data.uploadedFiles.map((file) => ({
                    objectKey: file.objectKey,
                    fileName: file.fileName,
                    fileType: file.fileType,
                    sizeBytes: file.sizeBytes,
                  })),
                },
              }
            : undefined,
        },
      });

      if (data.type === "CONSULTATION" && data.availabilitySlotId) {
        const updated = await tx.availabilitySlot.updateMany({
          where: { id: data.availabilitySlotId, isBooked: false },
          data: {
            isBooked: true,
            bookedRequestId: createdRequest.id,
          },
        });

        if (updated.count === 0) {
          throw new Error("SLOT_UNAVAILABLE");
        }
      }

      return createdRequest;
    });

    await sendEmail({
      to: session.user.email ?? "",
      subject: "ثبت درخواست در فرما",
      html:
        created.type === "CONSULTATION" && created.meetingStartAt
          ? `<p>درخواست مشاوره شما با شماره <strong>${created.id}</strong> ثبت شد.</p>
             <p>زمان جلسه: <strong>${formatJalali(created.meetingStartAt, true)}</strong></p>`
          : `<p>درخواست شما با شماره <strong>${created.id}</strong> ثبت شد.</p>`,
    });

    const adminEmails = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "SALES"] } },
      select: { email: true },
    });

    await sendEmail({
      to: adminEmails.map((user) => user.email),
      subject: "درخواست جدید در فرما",
      html: `<p>درخواست جدید با شناسه ${created.id} ثبت شد.</p>`,
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "REQUEST_FAILED";
    if (message === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ error: "این بازه زمانی دیگر در دسترس نیست." }, { status: 409 });
    }

    return NextResponse.json({ error: "ثبت درخواست انجام نشد." }, { status: 500 });
  }
}
