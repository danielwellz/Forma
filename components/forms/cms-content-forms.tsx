"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  AboutContent,
  ContactContent,
  HeroContent,
  ServiceItem,
  ServicesContent,
} from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function saveBlock(key: string, contentFa: unknown) {
  const response = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, contentFa }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "ذخیره انجام نشد.");
  }
}

function SaveActions({ pending, error, onSave }: { pending: boolean; error: string | null; onSave: () => void }) {
  return (
    <div className="space-y-2">
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <Button type="button" disabled={pending} onClick={onSave}>
        {pending ? "در حال ذخیره..." : "ذخیره"}
      </Button>
    </div>
  );
}

export function HeroContentForm({ initial }: { initial: HeroContent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(initial);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>نام شرکت</Label>
          <Input value={value.companyNameFa} onChange={(event) => setValue({ ...value, companyNameFa: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Tagline انگلیسی</Label>
          <Input dir="ltr" value={value.taglineEn} onChange={(event) => setValue({ ...value, taglineEn: event.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tagline فارسی</Label>
        <Input value={value.taglineFa} onChange={(event) => setValue({ ...value, taglineFa: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>متن تکمیلی هدر</Label>
        <Textarea rows={4} value={value.subtitleFa} onChange={(event) => setValue({ ...value, subtitleFa: event.target.value })} />
      </div>
      <SaveActions
        pending={pending}
        error={error}
        onSave={() => {
          startTransition(async () => {
            try {
              setError(null);
              await saveBlock("homepage_hero", value);
              router.refresh();
            } catch (saveError) {
              setError(saveError instanceof Error ? saveError.message : "ذخیره انجام نشد.");
            }
          });
        }}
      />
    </div>
  );
}

export function AboutContentForm({ initial }: { initial: AboutContent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [intro, setIntro] = useState(initial.intro);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>معرفی کوتاه درباره استودیو</Label>
        <Textarea rows={6} value={intro} onChange={(event) => setIntro(event.target.value)} />
      </div>
      <SaveActions
        pending={pending}
        error={error}
        onSave={() => {
          startTransition(async () => {
            try {
              setError(null);
              await saveBlock("about", { intro });
              router.refresh();
            } catch (saveError) {
              setError(saveError instanceof Error ? saveError.message : "ذخیره انجام نشد.");
            }
          });
        }}
      />
    </div>
  );
}

function ServiceItemForm({
  index,
  value,
  onChange,
}: {
  index: number;
  value: ServiceItem;
  onChange: (next: ServiceItem) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="text-sm font-semibold text-stone-800">خدمت {index + 1}</p>
      <div className="space-y-2">
        <Label>عنوان</Label>
        <Input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>توضیح کوتاه</Label>
        <Textarea rows={3} value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} />
      </div>
    </div>
  );
}

export function ServicesContentForm({ initial }: { initial: ServicesContent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(initial);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        {value.items.map((item, index) => (
          <ServiceItemForm
            key={`service-${index}`}
            index={index}
            value={item}
            onChange={(next) => {
              const copy = [...value.items];
              copy[index] = next;
              setValue({ ...value, items: copy });
            }}
          />
        ))}
      </div>
      <div className="space-y-2">
        <Label>متن تکمیلی خدمات</Label>
        <Textarea rows={4} value={value.extraText} onChange={(event) => setValue({ ...value, extraText: event.target.value })} />
      </div>
      <SaveActions
        pending={pending}
        error={error}
        onSave={() => {
          startTransition(async () => {
            try {
              setError(null);
              await saveBlock("services", value);
              router.refresh();
            } catch (saveError) {
              setError(saveError instanceof Error ? saveError.message : "ذخیره انجام نشد.");
            }
          });
        }}
      />
    </div>
  );
}

export function ContactContentForm({ initial }: { initial: ContactContent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(initial);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {value.phones.map((phone, index) => (
          <div key={`phone-${index}`} className="space-y-2">
            <Label>شماره تماس {index + 1}</Label>
            <Input value={phone} onChange={(event) => {
              const phones = [...value.phones];
              phones[index] = event.target.value;
              setValue({ ...value, phones });
            }} />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>ساعت کاری</Label>
        <Input value={value.workingHours} onChange={(event) => setValue({ ...value, workingHours: event.target.value })} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Instagram Handle</Label>
          <Input value={value.instagramHandle} onChange={(event) => setValue({ ...value, instagramHandle: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Instagram URL</Label>
          <Input dir="ltr" value={value.instagramUrl} onChange={(event) => setValue({ ...value, instagramUrl: event.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>آدرس</Label>
        <Textarea rows={3} value={value.address} onChange={(event) => setValue({ ...value, address: event.target.value })} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>لینک Embed نقشه</Label>
          <Input dir="ltr" value={value.mapEmbedUrl} onChange={(event) => setValue({ ...value, mapEmbedUrl: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>ایمیل عمومی (اختیاری)</Label>
          <Input dir="ltr" value={value.email ?? ""} onChange={(event) => setValue({ ...value, email: event.target.value })} />
          <p className="text-xs text-stone-500">اگر خالی باشد در صفحات عمومی نمایش داده نمی‌شود.</p>
        </div>
      </div>

      <SaveActions
        pending={pending}
        error={error}
        onSave={() => {
          startTransition(async () => {
            try {
              setError(null);
              await saveBlock("contact", value);
              router.refresh();
            } catch (saveError) {
              setError(saveError instanceof Error ? saveError.message : "ذخیره انجام نشد.");
            }
          });
        }}
      />
    </div>
  );
}
