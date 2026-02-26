import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message?.trim();

  if (!message || message.length < 2) {
    return NextResponse.json({ error: "پیام نامعتبر است." }, { status: 400 });
  }

  const record = await prisma.request.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "SALES", "EDITOR"]);
  if (!isAdmin && record.clientId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const created = await prisma.requestMessage.create({
    data: {
      requestId: id,
      authorId: session.user.id,
      message,
    },
    select: { id: true },
  });

  return NextResponse.json(created, { status: 201 });
}
