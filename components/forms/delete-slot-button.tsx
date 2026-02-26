"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteSlotButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending || disabled}
      onClick={() => {
        startTransition(async () => {
          await fetch(`/api/admin/availability/${id}`, { method: "DELETE" });
          router.refresh();
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
