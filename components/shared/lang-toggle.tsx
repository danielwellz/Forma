"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LangToggle({ lang }: { lang: "fa" | "en" }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/lang", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang: lang === "fa" ? "en" : "fa" }),
          });
          router.refresh();
        });
      }}
    >
      {lang === "fa" ? "EN" : "FA"}
    </Button>
  );
}
