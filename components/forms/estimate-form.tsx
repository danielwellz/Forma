"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeNumericInput } from "@/lib/jalali";
import { estimateSchema } from "@/lib/validation";

type FormValues = z.input<typeof estimateSchema>;

export function EstimateForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues, unknown, z.output<typeof estimateSchema>>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      requestId,
      costAmount: 0,
      timeEstimateText: "",
      nextStepsFa: "",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null);

        const res = await fetch("/api/estimates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "ارسال برآورد انجام نشد.");
          return;
        }

        router.refresh();
        form.reset({ requestId, costAmount: 0, timeEstimateText: "", nextStepsFa: "" });
      })}
    >
      <div className="space-y-2">
        <Label>مبلغ (تومان)</Label>
        <Input
          inputMode="numeric"
          placeholder="مثلاً ۱,۲۰۰,۰۰۰,۰۰۰"
          {...form.register("costAmount", { setValueAs: (value) => normalizeNumericInput(String(value ?? "")) })}
        />
      </div>
      <div className="space-y-2">
        <Label>زمان تقریبی اجرا</Label>
        <Input {...form.register("timeEstimateText")} placeholder="مثلاً ۴ ماه" />
      </div>
      <div className="space-y-2">
        <Label>گام‌های بعدی</Label>
        <Textarea rows={4} {...form.register("nextStepsFa")} />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        ارسال برآورد
      </Button>
    </form>
  );
}
