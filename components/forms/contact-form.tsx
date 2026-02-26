"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toEnDigits } from "@/lib/jalali";
import { contactSchema } from "@/lib/validation";

type FormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      type: "CONTACT",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null);
        setSuccess(false);

        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "ارسال پیام ناموفق بود.");
          return;
        }

        setSuccess(true);
        form.reset({
          name: "",
          phone: "",
          email: "",
          message: "",
          type: "CONTACT",
        });
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">نام</Label>
          <Input id="name" {...form.register("name")} />
          <p className="text-xs text-red-600">{form.formState.errors.name?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">تلفن</Label>
          <Input
            id="phone"
            {...form.register("phone", {
              setValueAs: (value) =>
                toEnDigits(String(value ?? ""))
                  .replace(/[^\d]/g, "")
                  .slice(0, 15),
            })}
          />
          <p className="text-xs text-red-600">{form.formState.errors.phone?.message}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">ایمیل (اختیاری)</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">نوع درخواست</Label>
        <Select id="type" {...form.register("type")}>
          <option value="CONTACT">پیام عمومی</option>
          <option value="ESTIMATE">درخواست برآورد</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">پیام</Label>
        <Textarea id="message" rows={5} {...form.register("message")} />
        <p className="text-xs text-red-600">{form.formState.errors.message?.message}</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">پیام شما با موفقیت ثبت شد.</p> : null}

      <Button className="w-full" disabled={form.formState.isSubmitting}>
        ارسال
      </Button>
    </form>
  );
}
