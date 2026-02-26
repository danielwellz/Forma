import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deleteObjectByKey } from "@/lib/s3";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const file = await prisma.requestFile.findUnique({
    where: { id },
    include: {
      request: true,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "SALES", "EDITOR"]);
  const isOwner = file.request.clientId === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.requestFile.delete({ where: { id: file.id } });

  if (!/^https?:\/\//.test(file.objectKey)) {
    try {
      await deleteObjectByKey(file.objectKey);
    } catch {
      // If object deletion fails, DB row is already removed to avoid stale references in UI.
    }
  }

  return NextResponse.json({ ok: true });
}
