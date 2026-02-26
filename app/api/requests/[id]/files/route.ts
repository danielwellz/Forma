import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_SIZE_BYTES, REQUEST_ALLOWED_MIME_TYPES, isAllowedMimeType } from "@/lib/upload";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { objectKey?: string; fileName?: string; fileType?: string; sizeBytes?: number }
    | null;

  if (!body?.objectKey || !body.fileName || !body.fileType || !body.sizeBytes) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!isAllowedMimeType(body.fileType, REQUEST_ALLOWED_MIME_TYPES)) {
    return NextResponse.json({ error: "نوع فایل مجاز نیست." }, { status: 400 });
  }

  if (!Number.isFinite(body.sizeBytes) || body.sizeBytes <= 0 || body.sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ error: "حجم فایل نامعتبر است." }, { status: 400 });
  }

  const requestEntity = await prisma.request.findUnique({ where: { id } });
  if (!requestEntity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "SALES", "EDITOR"]);
  if (!isAdmin && requestEntity.clientId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ownerPrefix = `requests/${requestEntity.clientId}/`;
  if (!body.objectKey.startsWith(ownerPrefix) && !(isAdmin && body.objectKey.startsWith("requests/"))) {
    return NextResponse.json({ error: "کلید فایل معتبر نیست." }, { status: 400 });
  }

  const created = await prisma.requestFile.create({
    data: {
      requestId: id,
      objectKey: body.objectKey,
      fileName: body.fileName,
      fileType: body.fileType,
      sizeBytes: body.sizeBytes,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
