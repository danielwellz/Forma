"use client";

import { useTransition } from "react";
import { Download, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatJalali } from "@/lib/jalali";
import { formatFileSizeFa } from "@/lib/upload";

type RequestFileItem = {
  id: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt: string | Date;
};

export function RequestFileList({
  files,
  canDelete,
}: {
  files: RequestFileItem[];
  canDelete?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (files.length === 0) {
    return <p className="text-sm text-stone-600">فایلی ثبت نشده است.</p>;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-800">{file.fileName}</p>
            <p className="text-xs text-stone-500">
              {formatFileSizeFa(file.sizeBytes)} - {formatJalali(file.uploadedAt, true)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/request-files/${file.id}/download`} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>

            {canDelete ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await fetch(`/api/request-files/${file.id}`, { method: "DELETE" });
                    router.refresh();
                  });
                }}
              >
                {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
