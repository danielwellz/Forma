"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestType } from "@prisma/client";
import { z } from "zod";
import { FileUpload, type UploadedFile } from "@/components/forms/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  contactMethodLabelsFa,
  projectCategoryLabelsFa,
  requestScopeLabelsFa,
  requestTypeLabelsFa,
} from "@/lib/constants";
import { formatJalali, normalizeNumericInput, toFaDigits } from "@/lib/jalali";
import { requestSchema } from "@/lib/validation";

type FormValues = z.input<typeof requestSchema>;

type Slot = {
  id: string;
  startAt: string;
  endAt: string;
};

type SourceProject = {
  id: string;
  titleFa: string;
  locationFa: string;
  year: number;
};

export function RequestForm({
  initialType,
  sourceProject,
  slots,
}: {
  initialType: RequestType;
  sourceProject?: SourceProject;
  slots: Slot[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const prefilledDescription =
    sourceProject && initialType === "ESTIMATE"
      ? `درخواست برآورد برای پروژه مشابه «${sourceProject.titleFa}» در ${sourceProject.locationFa} (${toFaDigits(
          sourceProject.year,
        )}). لطفاً جزئیات پروژه من را بررسی کنید.`
      : "";

  const form = useForm<FormValues, unknown, z.output<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: initialType,
      projectType: "RESIDENTIAL",
      locationCityFa: sourceProject?.locationFa ?? "",
      addressFa: "",
      areaSqm: undefined,
      scope: "DESIGN_BUILD",
      budgetMin: undefined,
      budgetMax: undefined,
      budgetRangeText: "",
      timelineTarget: "",
      descriptionFa: prefilledDescription,
      preferredContactMethod: "PHONE",
      sourceProjectId: sourceProject?.id,
      uploadedFiles: [],
    },
  });

  const selectedType = useWatch({ control: form.control, name: "type" });
  const selectedSlotId = useWatch({ control: form.control, name: "availabilitySlotId" });

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId),
    [slots, selectedSlotId],
  );

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null);

        const payload = {
          ...values,
          uploadedFiles,
          meetingStartAt: selectedSlot ? selectedSlot.startAt : undefined,
          meetingEndAt: selectedSlot ? selectedSlot.endAt : undefined,
        };

        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "ثبت درخواست ناموفق بود.");
          return;
        }

        const data = (await res.json()) as { id: string };
        router.push(`/portal/requests/${data.id}`);
      })}
    >
      {sourceProject ? (
        <div className="rounded-xl border border-forma-200 bg-forma-50 p-3 text-sm text-forma-900">
          این درخواست بر اساس پروژه «{sourceProject.titleFa}» ثبت می‌شود.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">نوع درخواست</Label>
          <Select id="type" {...form.register("type")}>
            {Object.entries(requestTypeLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectType">نوع پروژه</Label>
          <Select id="projectType" {...form.register("projectType")}>
            {Object.entries(projectCategoryLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="locationCityFa">شهر</Label>
          <Input id="locationCityFa" {...form.register("locationCityFa")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressFa">آدرس</Label>
          <Input id="addressFa" {...form.register("addressFa")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="areaSqm">متراژ (مترمربع)</Label>
          <Input
            id="areaSqm"
            inputMode="numeric"
            {...form.register("areaSqm", { setValueAs: (value) => normalizeNumericInput(String(value ?? "")) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scope">دامنه خدمات</Label>
          <Select id="scope" {...form.register("scope")}>
            {Object.entries(requestScopeLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timelineTarget">زمان هدف</Label>
          <Input id="timelineTarget" placeholder="مثلاً تابستان ۱۴۰۵" {...form.register("timelineTarget")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="budgetMin">حداقل بودجه</Label>
          <Input
            id="budgetMin"
            inputMode="numeric"
            {...form.register("budgetMin", { setValueAs: (value) => normalizeNumericInput(String(value ?? "")) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budgetMax">حداکثر بودجه</Label>
          <Input
            id="budgetMax"
            inputMode="numeric"
            {...form.register("budgetMax", { setValueAs: (value) => normalizeNumericInput(String(value ?? "")) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredContactMethod">روش تماس</Label>
          <Select id="preferredContactMethod" {...form.register("preferredContactMethod")}>
            {Object.entries(contactMethodLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {selectedType === "CONSULTATION" ? (
        <div className="space-y-2">
          <Label htmlFor="availabilitySlotId">انتخاب زمان جلسه</Label>
          <Select id="availabilitySlotId" {...form.register("availabilitySlotId")}>
            <option value="">یک زمان انتخاب کنید</option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {formatJalali(slot.startAt, true)} تا {formatJalali(slot.endAt, true)}
              </option>
            ))}
          </Select>
          <p className="text-xs text-red-600">{form.formState.errors.availabilitySlotId?.message as string | undefined}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="descriptionFa">توضیحات پروژه</Label>
        <Textarea id="descriptionFa" rows={5} {...form.register("descriptionFa")} />
        <p className="text-xs text-red-600">{form.formState.errors.descriptionFa?.message}</p>
      </div>

      <div className="space-y-2">
        <Label>فایل‌های ضمیمه</Label>
        <FileUpload onChange={setUploadedFiles} value={uploadedFiles} prefix="requests" />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button disabled={form.formState.isSubmitting} className="w-full">
        ثبت درخواست
      </Button>
    </form>
  );
}
