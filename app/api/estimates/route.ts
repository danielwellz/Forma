import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { formatCurrencyToman } from "@/lib/jalali";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { estimateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "SALES"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = estimateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requestEntity = await prisma.request.findUnique({
    where: { id: parsed.data.requestId },
    include: { client: true },
  });

  if (!requestEntity) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const estimate = await prisma.estimate.upsert({
    where: { requestId: parsed.data.requestId },
    create: {
      requestId: parsed.data.requestId,
      costAmount: parsed.data.costAmount,
      timeEstimateText: parsed.data.timeEstimateText,
      nextStepsFa: parsed.data.nextStepsFa,
      currency: "IRR",
    },
    update: {
      costAmount: parsed.data.costAmount,
      timeEstimateText: parsed.data.timeEstimateText,
      nextStepsFa: parsed.data.nextStepsFa,
      sentAt: new Date(),
    },
  });

  await prisma.request.update({
    where: { id: parsed.data.requestId },
    data: { status: "ESTIMATE_SENT" },
  });

  await sendEmail({
    to: requestEntity.client.email,
    subject: "برآورد پروژه شما در فرما",
    html: `<p>برآورد اولیه پروژه شما آماده شد.</p>
      <p>مبلغ: <strong>${formatCurrencyToman(Number(parsed.data.costAmount))}</strong></p>
      <p>برای مشاهده جزئیات وارد پرتال فرما شوید.</p>`,
  });

  return NextResponse.json({ id: estimate.id }, { status: 201 });
}
