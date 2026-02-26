import { toFaDigits } from "@/lib/jalali";

export const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

export const REQUEST_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const PROJECT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type UploadMimeType = (typeof REQUEST_ALLOWED_MIME_TYPES)[number] | (typeof PROJECT_ALLOWED_MIME_TYPES)[number];

export function isAllowedMimeType(mimeType: string, allowed: readonly string[]) {
  return allowed.includes(mimeType);
}

export function sanitizeFileName(name: string) {
  const sanitized = name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF.-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return sanitized.length > 0 ? sanitized : "file";
}

export function formatFileSizeFa(sizeBytes?: number | null) {
  if (!sizeBytes || sizeBytes < 0) {
    return "-";
  }

  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  let size = sizeBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const rounded = size >= 10 || unitIndex === 0 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${toFaDigits(rounded.toLocaleString("fa-IR"))} ${units[unitIndex]}`;
}
