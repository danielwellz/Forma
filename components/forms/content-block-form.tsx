"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContentBlockForm({
  blockKey,
  initialFa,
  initialEn,
}: {
  blockKey: string;
  initialFa: string;
  initialEn?: string;
}) {
  const [contentFa, setContentFa] = useState(initialFa);
  const [contentEn, setContentEn] = useState(initialEn ?? "");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);

        const faJson = (() => {
          try {
            return JSON.parse(contentFa);
          } catch {
            return { text: contentFa };
          }
        })();

        const enJson = (() => {
          if (!contentEn.trim()) {
            return undefined;
          }

          try {
            return JSON.parse(contentEn);
          } catch {
            return { text: contentEn };
          }
        })();

        const res = await fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: blockKey,
            contentFa: faJson,
            contentEn: enJson,
          }),
        });

        setPending(false);
        if (res.ok) {
          router.refresh();
        }
      }}
    >
      <div className="space-y-2">
        <Label>محتوای فارسی (JSON یا متن)</Label>
        <Textarea rows={8} value={contentFa} onChange={(event) => setContentFa(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>محتوای انگلیسی (اختیاری)</Label>
        <Textarea rows={5} value={contentEn} onChange={(event) => setContentEn(event.target.value)} />
      </div>
      <Button disabled={pending}>ذخیره</Button>
    </form>
  );
}
