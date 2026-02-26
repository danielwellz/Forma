"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RequestMessageForm({ requestId }: { requestId: string }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-2">
      <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} />
      <Button
        disabled={submitting || message.trim().length < 2}
        onClick={async () => {
          setSubmitting(true);
          const res = await fetch(`/api/requests/${requestId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          });

          setSubmitting(false);
          if (res.ok) {
            setMessage("");
            router.refresh();
          }
        }}
      >
        ارسال پیام
      </Button>
    </div>
  );
}
