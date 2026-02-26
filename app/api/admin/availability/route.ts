import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { availabilitySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user || !hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "SALES"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  const repeatWeeks = parsed.data.repeatWeeks ?? 1;

  if (startAt >= endAt) {
    return NextResponse.json({ error: "زمان شروع باید قبل از پایان باشد." }, { status: 400 });
  }

  const slots = Array.from({ length: repeatWeeks }).map((_, index) => ({
    startAt: new Date(startAt.getTime() + index * 7 * 24 * 60 * 60 * 1000),
    endAt: new Date(endAt.getTime() + index * 7 * 24 * 60 * 60 * 1000),
  }));

  const created = await prisma.availabilitySlot.createMany({
    data: slots,
  });

  return NextResponse.json({ count: created.count }, { status: 201 });
}
