import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user || !hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "SALES"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
  if (!slot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (slot.isBooked) {
    return NextResponse.json({ error: "اسلات رزرو شده قابل حذف نیست." }, { status: 409 });
  }

  await prisma.availabilitySlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
