"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatJalali } from "@/lib/jalali";
import {
  MAX_UPLOAD_SIZE_BYTES,
  REQUEST_ALLOWED_MIME_TYPES,
  formatFileSizeFa,
  isAllowedMimeType,
} from "@/lib/upload";

export type UploadedFile = {
  objectKey: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt?: string;
  publicUrl?: string;
};

type UploadTask = {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function FileUpload({
  onChange,
  value = [],
  prefix,
  allowedMimeTypes = REQUEST_ALLOWED_MIME_TYPES,
  maxSizeBytes = MAX_UPLOAD_SIZE_BYTES,
}: {
  onChange: (files: UploadedFile[]) => void;
  value?: UploadedFile[];
  prefix: string;
  allowedMimeTypes?: readonly string[];
  maxSizeBytes?: number;
}) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const uploadWithProgress = async (uploadUrl: string, file: File, taskId: string) => {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const progress = Math.round((event.loaded / event.total) * 100);
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, progress } : task)),
        );
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }

        reject(new Error("آپلود فایل ناموفق بود."));
      };

      xhr.onerror = () => reject(new Error("خطا در آپلود فایل."));
      xhr.send(file);
    });
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const nextFiles = [...value];
    const nextErrors: string[] = [];

    for (const file of Array.from(files)) {
      if (!isAllowedMimeType(file.type, allowedMimeTypes)) {
        nextErrors.push(`فرمت فایل ${file.name} مجاز نیست.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        nextErrors.push(`حجم فایل ${file.name} بیشتر از ${formatFileSizeFa(maxSizeBytes)} است.`);
        continue;
      }

      const taskId = `${Date.now()}-${Math.random()}`;
      setTasks((prev) => [...prev, { id: taskId, fileName: file.name, progress: 0, status: "uploading" }]);

      try {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            prefix,
          }),
        });

        if (!presignRes.ok) {
          const data = (await presignRes.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "خطا در دریافت لینک آپلود");
        }

        const data = (await presignRes.json()) as { uploadUrl: string; objectKey: string; publicUrl?: string };
        await uploadWithProgress(data.uploadUrl, file, taskId);

        nextFiles.push({
          objectKey: data.objectKey,
          fileName: file.name,
          fileType: file.type,
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
          publicUrl: data.publicUrl,
        });

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, progress: 100, status: "done" } : task,
          ),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "خطای ناشناخته در آپلود";
        nextErrors.push(message);
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, status: "error", error: message } : task,
          ),
        );
      }
    }

    setErrors(nextErrors);
    onChange(nextFiles);
  };

  const isUploading = tasks.some((task) => task.status === "uploading");

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-forma-200 bg-forma-50 px-4 py-6 text-sm text-forma-900 hover:bg-forma-100">
        {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        {isUploading ? "در حال آپلود..." : "آپلود فایل"}
        <input
          type="file"
          multiple
          className="hidden"
          disabled={isUploading}
          onChange={(event) => uploadFiles(event.target.files)}
        />
      </label>

      {tasks.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-3">
          {tasks.map((task) => (
            <div key={task.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate">{task.fileName}</span>
                <span className="flex items-center gap-1 text-stone-500">
                  {task.status === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : null}
                  {task.status === "uploading" ? `${task.progress}%` : task.status === "error" ? "خطا" : "تکمیل"}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className={`h-full rounded-full transition-all ${task.status === "error" ? "bg-red-500" : "bg-forma-700"}`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              {task.error ? <p className="text-xs text-red-600">{task.error}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {errors.length > 0 ? (
        <div className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3">
          {errors.map((error, idx) => (
            <p key={`${error}-${idx}`} className="text-xs text-red-700">
              {error}
            </p>
          ))}
        </div>
      ) : null}

      {value.length > 0 ? (
        <div className="space-y-1">
          {value.map((file) => (
            <div key={`${file.objectKey}-${file.fileName}`} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs">
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-700">{file.fileName}</p>
                <p className="text-stone-500">
                  {formatFileSizeFa(file.sizeBytes)}
                  {file.uploadedAt ? ` - ${formatJalali(file.uploadedAt, true)}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(value.filter((item) => item.objectKey !== file.objectKey))}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
