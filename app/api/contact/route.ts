import { NextResponse } from "next/server";
import { toEnDigits } from "@/lib/jalali";
import { checkRateLimit, getRequestIp, shouldEnforceRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  if (shouldEnforceRateLimit()) {
    const limit = checkRateLimit(`contact:${ip}`, 6, 60_000);
    if (!limit.ok) {
      return NextResponse.json({ error: "تعداد درخواست زیاد است. چند دقیقه دیگر تلاش کنید." }, { status: 429 });
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });
  }

  const data = parsed.data;
  const normalizedPhone = toEnDigits(data.phone).replace(/[^\d]/g, "");

  await prisma.contactMessage.create({
    data: {
      name: data.name,
      phone: normalizedPhone,
      email: data.email || null,
      message: data.message,
    },
  });

  const guestEmail = data.email && data.email.length ? data.email : `${Date.now()}-${normalizedPhone}@guest.local`;
  const guest = await prisma.user.upsert({
    where: { email: guestEmail },
    create: {
      name: data.name,
      email: guestEmail,
      phone: normalizedPhone,
      role: "CLIENT",
    },
    update: {
      name: data.name,
      phone: normalizedPhone,
    },
  });

  await prisma.request.create({
    data: {
      type: "ESTIMATE",
      clientId: guest.id,
      projectType: "RESIDENTIAL",
      locationCityFa: "نامشخص",
      addressFa: "نامشخص",
      scope: "DESIGN_BUILD",
      descriptionFa: `پیام فرم تماس (${data.type}): ${data.message}`,
      preferredContactMethod: data.email ? "EMAIL" : "PHONE",
    },
  });

  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["SUPER_ADMIN", "ADMIN", "SALES"] },
    },
    select: { email: true },
  });

  await sendEmail({
    to: admins.map((item) => item.email),
    subject: "پیام جدید از فرم تماس",
    html: `<p><strong>${data.name}</strong> (${normalizedPhone}) پیامی ارسال کرد.</p><p>${data.message}</p>`,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
