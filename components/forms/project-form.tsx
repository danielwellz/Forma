"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import slugify from "slugify";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectCategory, ServiceType } from "@prisma/client";
import { z } from "zod";
import { FileUpload, type UploadedFile } from "@/components/forms/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { projectCategoryLabelsFa, serviceTypeLabelsFa } from "@/lib/constants";
import { normalizeNumericInput } from "@/lib/jalali";
import { PROJECT_ALLOWED_MIME_TYPES } from "@/lib/upload";
import { projectSchema } from "@/lib/validation";

type FormValues = z.input<typeof projectSchema>;

export function ProjectForm({
  initial,
  projectId,
}: {
  initial?: Partial<FormValues>;
  projectId?: string;
}) {
  const router = useRouter();
  const [gallery, setGallery] = useState<UploadedFile[]>([]);
  const [videoUrls, setVideoUrls] = useState(
    (initial?.media ?? [])
      .filter((item) => item.type === "VIDEO")
      .map((item) => item.url)
      .join("\n"),
  );

  const form = useForm<FormValues, unknown, z.output<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      slug: initial?.slug ?? "",
      titleFa: initial?.titleFa ?? "",
      titleEn: initial?.titleEn ?? "",
      category: initial?.category ?? ProjectCategory.RESIDENTIAL,
      locationFa: initial?.locationFa ?? "",
      year: initial?.year ?? new Date().getFullYear(),
      areaSqm: initial?.areaSqm ?? 120,
      scopeFa: initial?.scopeFa ?? "",
      servicesProvided: initial?.servicesProvided ?? [ServiceType.ARCHITECTURE],
      descriptionFa: initial?.descriptionFa ?? "",
      featured: initial?.featured ?? false,
      published: initial?.published ?? false,
      coverImageUrl: initial?.coverImageUrl ?? "",
      media: initial?.media ?? [],
      metaTitleFa: initial?.metaTitleFa ?? "",
      metaDescriptionFa: initial?.metaDescriptionFa ?? "",
    },
  });

  const watchedTitleFa = useWatch({ control: form.control, name: "titleFa" });
  const selectedServices = useWatch({ control: form.control, name: "servicesProvided" });
  const coverPreview = useWatch({ control: form.control, name: "coverImageUrl" });
  const featured = useWatch({ control: form.control, name: "featured" });
  const published = useWatch({ control: form.control, name: "published" });

  useEffect(() => {
    if (!projectId) {
      const slug = slugify(watchedTitleFa ?? "", { lower: true, strict: true, locale: "fa" });
      form.setValue("slug", slug);
    }
  }, [form, projectId, watchedTitleFa]);

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(async (values) => {
        const existingMedia = values.media ?? [];
        const existingUrls = new Set(existingMedia.map((item) => item.url));
        const parsedVideoUrls = videoUrls
          .split("\n")
          .map((value) => value.trim())
          .filter((value) => value.length > 0);

        const extraVideos = parsedVideoUrls
          .filter((url) => !existingUrls.has(url))
          .map((url, index) => ({
            url,
            altFa: `ویدئو پروژه ${index + 1}`,
            type: "VIDEO" as const,
            order: existingMedia.length + gallery.length + index,
          }));

        const payload: FormValues = {
          ...values,
          media: [
            ...existingMedia,
            ...gallery.map((item, index) => ({
              url: item.publicUrl ?? item.objectKey,
              altFa: item.fileName,
              type: "IMAGE" as const,
              order: existingMedia.length + index,
            })),
            ...extraVideos,
          ],
        };

        const url = projectId ? `/api/admin/projects/${projectId}` : "/api/admin/projects";
        const method = projectId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          router.push("/admin/projects");
          router.refresh();
        }
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>عنوان فارسی</Label>
          <Input {...form.register("titleFa")} />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input {...form.register("slug")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>دسته پروژه</Label>
          <Select {...form.register("category")}>
            {Object.entries(projectCategoryLabelsFa).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>موقعیت</Label>
          <Input {...form.register("locationFa")} />
        </div>
        <div className="space-y-2">
          <Label>سال</Label>
          <Input inputMode="numeric" {...form.register("year", { setValueAs: (value) => normalizeNumericInput(String(value ?? "")) })} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>متراژ</Label>
          <Input inputMode="numeric" {...form.register("areaSqm", { setValueAs: (value) => normalizeNumericInput(String(value ?? "")) })} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>دامنه</Label>
          <Input {...form.register("scopeFa")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>خدمات ارائه‌شده</Label>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {Object.entries(serviceTypeLabelsFa).map(([value, label]) => {
            const checked = selectedServices?.includes(value as ServiceType);
            return (
              <label key={value} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const current = form.getValues("servicesProvided") ?? [];
                    const next = event.target.checked
                      ? [...new Set([...current, value as ServiceType])]
                      : current.filter((item) => item !== value);
                    form.setValue("servicesProvided", next);
                  }}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>توضیحات</Label>
        <Textarea rows={6} {...form.register("descriptionFa")} />
      </div>

      <div className="space-y-2">
        <Label>تصویر کاور (URL)</Label>
        <Input {...form.register("coverImageUrl")} />
        {coverPreview ? (
          <div className="relative h-36 w-full overflow-hidden rounded-xl">
            <Image src={coverPreview} alt="cover" fill className="object-cover" />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>آپلود تصاویر گالری</Label>
        <FileUpload onChange={setGallery} value={gallery} prefix="projects" allowedMimeTypes={PROJECT_ALLOWED_MIME_TYPES} />
      </div>

      <div className="space-y-2">
        <Label>لینک ویدئو (اختیاری)</Label>
        <Textarea
          rows={3}
          value={videoUrls}
          onChange={(event) => setVideoUrls(event.target.value)}
          placeholder="هر لینک در یک خط (mp4 یا لینک مستقیم فایل ویدئو)"
          dir="ltr"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => form.setValue("featured", e.target.checked)} />
          پروژه شاخص
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => form.setValue("published", e.target.checked)} />
          منتشر شود
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input {...form.register("metaTitleFa")} />
        </div>
        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Input {...form.register("metaDescriptionFa")} />
        </div>
      </div>

      <Button className="w-full" disabled={form.formState.isSubmitting}>
        ذخیره پروژه
      </Button>
    </form>
  );
}
