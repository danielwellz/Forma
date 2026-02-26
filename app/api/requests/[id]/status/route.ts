import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { requestStatusLabelsFa } from "@/lib/constants";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { requestStatusSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "SALES"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = requestStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status payload" }, { status: 400 });
  }

  const existing = await prisma.request.findUnique({
    where: { id },
    select: { status: true, assignedToId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const historyNotes: string[] = [];
  if (existing.status !== parsed.data.status) {
    historyNotes.push(
      `تغییر وضعیت: ${requestStatusLabelsFa[existing.status]} → ${requestStatusLabelsFa[parsed.data.status]}`,
    );
  }

  if ((existing.assignedToId ?? null) !== (parsed.data.assignedToId ?? null)) {
    historyNotes.push("تغییر مسئول پیگیری درخواست");
  }

  if (parsed.data.note?.trim()) {
    historyNotes.push(parsed.data.note.trim());
  }

  const updated = await prisma.request.update({
    where: { id },
    data: {
      status: parsed.data.status,
      assignedToId: parsed.data.assignedToId,
      notes: historyNotes.length
        ? {
            create: {
              authorId: session.user.id,
              note: historyNotes.join(" | "),
            },
          }
        : undefined,
    },
  });

  return NextResponse.json({ id: updated.id });
}
