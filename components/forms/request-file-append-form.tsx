"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload, type UploadedFile } from "@/components/forms/file-upload";
import { Button } from "@/components/ui/button";

export function RequestFileAppendForm({ requestId }: { requestId: string }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-3">
      <FileUpload value={files} onChange={setFiles} prefix="requests" />
      <Button
        disabled={pending || files.length === 0}
        onClick={async () => {
          setPending(true);

          for (const file of files) {
            const res = await fetch(`/api/requests/${requestId}/files`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(file),
            });

            if (!res.ok) {
              setPending(false);
              return;
            }
          }

          setFiles([]);
          setPending(false);
          router.refresh();
        }}
      >
        افزودن فایل به درخواست
      </Button>
    </div>
  );
}
