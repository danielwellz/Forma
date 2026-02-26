"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toEnDigits } from "@/lib/jalali";
import { signUpSchema } from "@/lib/validation";

type FormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null);
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "ثبت‌نام ناموفق بود.");
          return;
        }

        await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        router.push("/portal");
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="name">نام و نام خانوادگی</Label>
        <Input id="name" {...form.register("name")} />
        <p className="text-xs text-red-600">{form.formState.errors.name?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">ایمیل</Label>
        <Input id="email" type="email" {...form.register("email")} />
        <p className="text-xs text-red-600">{form.formState.errors.email?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">موبایل</Label>
        <Input
          id="phone"
          {...form.register("phone", {
            setValueAs: (value) =>
              toEnDigits(String(value ?? ""))
                .replace(/[^\d]/g, "")
                .slice(0, 15),
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">رمز عبور</Label>
        <Input id="password" type="password" {...form.register("password")} />
        <p className="text-xs text-red-600">{form.formState.errors.password?.message}</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        ثبت‌نام
      </Button>
    </form>
  );
}
