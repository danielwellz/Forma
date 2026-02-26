import { NextResponse } from "next/server";
import { formatJalali } from "@/lib/jalali";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const upcoming = await prisma.request.findMany({
    where: {
      status: "MEETING_SCHEDULED",
      meetingStartAt: {
        gte: from,
        lte: to,
      },
      meetingReminderSentAt: null,
    },
    include: {
      client: true,
    },
    take: 200,
  });

  for (const item of upcoming) {
    if (!item.client.email || !item.meetingStartAt) {
      continue;
    }

    await sendEmail({
      to: item.client.email,
      subject: "یادآوری جلسه مشاوره فرما",
      html: `<p>یادآوری جلسه مشاوره شما برای درخواست <strong>${item.id}</strong></p>
        <p>زمان جلسه: <strong>${formatJalali(item.meetingStartAt, true)}</strong></p>
        <p>در صورت نیاز به تغییر زمان، از طریق پرتال با تیم فرما در ارتباط باشید.</p>`,
    });
  }

  if (upcoming.length) {
    await prisma.request.updateMany({
      where: {
        id: { in: upcoming.map((item) => item.id) },
      },
      data: {
        meetingReminderSentAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    ok: true,
    remindersSent: upcoming.length,
    window: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
  });
}
