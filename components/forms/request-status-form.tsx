"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequestStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requestStatusLabelsFa } from "@/lib/constants";

export function RequestStatusForm({
  requestId,
  currentStatus,
  assignedToId,
  assignees,
}: {
  requestId: string;
  currentStatus: RequestStatus;
  assignedToId?: string | null;
  assignees: { id: string; name: string }[];
}) {
  const [status, setStatus] = useState<RequestStatus>(currentStatus);
  const [assigned, setAssigned] = useState(assignedToId ?? "");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);

        const res = await fetch(`/api/requests/${requestId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, assignedToId: assigned || undefined, note }),
        });

        setPending(false);
        if (res.ok) {
          setNote("");
          router.refresh();
        }
      }}
    >
      <div className="space-y-2">
        <Label>وضعیت</Label>
        <Select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>
          {Object.entries(requestStatusLabelsFa).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>مسئول</Label>
        <Select value={assigned} onChange={(event) => setAssigned(event.target.value)}>
          <option value="">بدون مسئول</option>
          {assignees.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>یادداشت داخلی</Label>
        <Input value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <Button disabled={pending} className="w-full">
        ذخیره تغییرات
      </Button>
    </form>
  );
}
