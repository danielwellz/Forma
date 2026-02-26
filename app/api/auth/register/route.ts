import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { toEnDigits } from "@/lib/jalali";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "داده‌های ورودی معتبر نیست." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const phone = parsed.data.phone
    ? toEnDigits(parsed.data.phone).replace(/[^\d]/g, "").slice(0, 15)
    : null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone,
      passwordHash,
      role: "CLIENT",
    },
    select: {
      id: true,
      email: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
