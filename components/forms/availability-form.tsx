"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeNumericInput } from "@/lib/jalali";

export function AvailabilityForm() {
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState("1");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      className="grid gap-3 md:grid-cols-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);

        const res = await fetch("/api/admin/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startAt, endAt, repeatWeeks: normalizeNumericInput(repeatWeeks) }),
        });

        setPending(false);
        if (res.ok) {
          setStartAt("");
          setEndAt("");
          setRepeatWeeks("1");
          router.refresh();
        }
      }}
    >
      <div className="space-y-2">
        <Label>شروع</Label>
        <Input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>پایان</Label>
        <Input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>تکرار هفتگی (اختیاری)</Label>
        <Input value={repeatWeeks} onChange={(event) => setRepeatWeeks(event.target.value)} placeholder="۱ = فقط یک اسلات" />
      </div>
      <div className="self-end">
        <Button className="w-full" disabled={pending}>
          افزودن اسلات
        </Button>
      </div>
    </form>
  );
}
