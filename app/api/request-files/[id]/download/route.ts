import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createPresignedDownload } from "@/lib/s3";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  if (!isAdmin && file.request.clientId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (/^https?:\/\//.test(file.objectKey)) {
    return NextResponse.redirect(file.objectKey);
  }

  const signedUrl = await createPresignedDownload({ key: file.objectKey, expiresInSec: 120 });
  return NextResponse.redirect(signedUrl);
}
