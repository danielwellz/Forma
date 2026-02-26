import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createPresignedUpload, getPublicFileUrl } from "@/lib/s3";
import {
  MAX_UPLOAD_SIZE_BYTES,
  REQUEST_ALLOWED_MIME_TYPES,
  PROJECT_ALLOWED_MIME_TYPES,
  isAllowedMimeType,
  sanitizeFileName,
} from "@/lib/upload";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { fileName?: string; fileType?: string; fileSize?: number; prefix?: string }
    | null;

  const fileName = sanitizeFileName(body?.fileName ?? "file");
  const fileType = body?.fileType ?? "application/octet-stream";
  const fileSize = Number(body?.fileSize ?? 0);
  const prefix = body?.prefix?.replace(/[^a-zA-Z0-9/_-]/g, "") ?? "uploads";
  const allowedPrefixes = ["requests", "projects"];

  if (!allowedPrefixes.some((value) => prefix.startsWith(value))) {
    return NextResponse.json({ error: "پوشه آپلود مجاز نیست." }, { status: 400 });
  }
  const allowedMimeTypes = prefix.startsWith("projects")
    ? PROJECT_ALLOWED_MIME_TYPES
    : REQUEST_ALLOWED_MIME_TYPES;

  if (!isAllowedMimeType(fileType, allowedMimeTypes)) {
    return NextResponse.json({ error: "نوع فایل مجاز نیست." }, { status: 400 });
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ error: "حجم فایل نامعتبر است." }, { status: 400 });
  }

  const key = `${prefix}/${session.user.id}/${randomUUID()}-${fileName}`;
  const signed = await createPresignedUpload({ key, contentType: fileType });

  return NextResponse.json({
    ...signed,
    publicUrl: prefix.startsWith("projects") ? getPublicFileUrl(key) : undefined,
  });
}
