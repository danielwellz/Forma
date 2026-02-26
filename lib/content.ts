import type { Prisma } from "@prisma/client";
import { toEnDigits } from "@/lib/jalali";

export type HeroContent = {
  companyNameFa: string;
  taglineFa: string;
  taglineEn: string;
  subtitleFa: string;
};

export type AboutContent = {
  intro: string;
};

export type ServiceItem = {
  title: string;
  description: string;
};

export type ServicesContent = {
  items: ServiceItem[];
  extraText: string;
};

export type ContactContent = {
  phones: string[];
  workingHours: string;
  instagramHandle: string;
  instagramUrl: string;
  address: string;
  mapEmbedUrl: string;
  email?: string;
};

export const defaultHeroContent: HeroContent = {
  companyNameFa: "گروه طراحی و ساخت فرما",
  taglineFa: "تخیل خود را بسازید",
  taglineEn: "Build your imagination",
  subtitleFa:
    "فرما با رویکرد طراحی-ساخت یکپارچه، از ایده تا تحویل نهایی پروژه‌های لوکس مسکونی، اداری و تجاری را با دقت اجرایی و زبان معماری معاصر هدایت می‌کند.",
};

export const defaultAboutContent: AboutContent = {
  intro:
    "گروه طراحی و ساخت فرما یک استودیوی حرفه‌ای معماری و اجراست که با تمرکز بر کیفیت فضایی، جزئیات ساخت و مدیریت دقیق فرآیند، پروژه‌ها را از فاز مشاوره تا بهره‌برداری نهایی پیش می‌برد.",
};

export const defaultServicesContent: ServicesContent = {
  items: [
    {
      title: "مشاوره، طراحی و نوسازی ساختمان های لوکس",
      description:
        "برای پروژه‌های شاخص، از تحلیل زمینه و تعریف کانسپت تا طراحی فنی و مدیریت نوسازی، راهکاری منسجم ارائه می‌کنیم.",
    },
    {
      title: "بازسازی و بهینه سازی تخصصی ساختمان های فرسوده",
      description:
        "با نگاه مهندسی به سازه، تاسیسات و کیفیت فضایی، ساختمان‌های موجود را به استانداردهای عملکردی و زیبایی امروز ارتقا می‌دهیم.",
    },
    {
      title: "طراحی و اجرای دکوراسیون داخلی مسکونی، اداری و تجاری",
      description:
        "طراحی داخلی را متناسب با سبک زندگی، هویت برند و جزئیات اجرایی انجام می‌دهیم تا نتیجه نهایی دقیقاً قابل ساخت و ماندگار باشد.",
    },
    {
      title: "مشاوره ، طراحی و اجرای فضاهای بیرونی شامل لنداسکیپ ، فضای سبز و بام سبز",
      description:
        "در طراحی فضاهای باز، پیوستگی میان معماری، طبیعت و تجربه کاربر را حفظ می‌کنیم تا پروژه هویت کامل‌تری پیدا کند.",
    },
  ],
  extraText:
    "در تمام خدمات فرما، شفافیت زمان‌بندی، کنترل هزینه و کیفیت اجرا در اولویت قرار دارد.",
};

export const defaultContactContent: ContactContent = {
  phones: ["۰۹۱۳۰۰۳۳۱۳۶", "۰۹۱۲۰۷۶۰۸۵۷", "۰۹۱۳۱۰۶۷۲۹۹"],
  workingHours:
    "شنبه تا چهارشنبه از ۹:۰۰ تا ۱۸:۰۰ - پنجشنبه ها از ۹:۰۰ تا ۱۴:۰۰ - به غیر از روزهای تعطیل",
  instagramHandle: "Formaco.ir",
  instagramUrl: "https://instagram.com/Formaco.ir",
  address: "اصفهان خیابان مهراباد مجتمع پارسیان .طبقه ۶",
  mapEmbedUrl: "https://www.google.com/maps?q=اصفهان+خیابان+مهراباد+مجتمع+پارسیان&output=embed",
  email: "",
};

export const serviceHighlightLines = defaultServicesContent.items.map((item) => item.title);

function asRecord(value: Prisma.JsonValue | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function resolveHeroContent(value: Prisma.JsonValue | undefined): HeroContent {
  const record = asRecord(value);
  if (!record) {
    return defaultHeroContent;
  }

  return {
    companyNameFa: pickString(record.companyNameFa, defaultHeroContent.companyNameFa),
    taglineFa: pickString(record.taglineFa, defaultHeroContent.taglineFa),
    taglineEn: pickString(record.taglineEn, defaultHeroContent.taglineEn),
    subtitleFa: pickString(record.subtitleFa, defaultHeroContent.subtitleFa),
  };
}

export function resolveAboutContent(value: Prisma.JsonValue | undefined): AboutContent {
  const record = asRecord(value);
  if (!record) {
    return defaultAboutContent;
  }

  return {
    intro: pickString(record.intro, defaultAboutContent.intro),
  };
}

export function resolveServicesContent(value: Prisma.JsonValue | undefined): ServicesContent {
  const record = asRecord(value);
  if (!record) {
    return defaultServicesContent;
  }

  const rawItems = Array.isArray(record.items) ? record.items : [];
  const items = rawItems
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const row = item as Record<string, unknown>;
      const fallback = defaultServicesContent.items[index] ?? defaultServicesContent.items[0];
      return {
        title: pickString(row.title, fallback.title),
        description: pickString(row.description, fallback.description),
      } satisfies ServiceItem;
    })
    .filter((item): item is ServiceItem => Boolean(item));

  return {
    items: items.length ? items : defaultServicesContent.items,
    extraText: pickString(record.extraText, defaultServicesContent.extraText),
  };
}

export function resolveContactContent(value: Prisma.JsonValue | undefined): ContactContent {
  const record = asRecord(value);
  if (!record) {
    return defaultContactContent;
  }

  const phones = toStringArray(record.phones);
  const normalizedPhones = phones.length
    ? [...phones, ...defaultContactContent.phones].slice(0, 3)
    : defaultContactContent.phones;

  return {
    phones: normalizedPhones,
    workingHours: pickString(record.workingHours, defaultContactContent.workingHours),
    instagramHandle: pickString(record.instagramHandle, defaultContactContent.instagramHandle),
    instagramUrl: pickString(record.instagramUrl, defaultContactContent.instagramUrl),
    address: pickString(record.address, defaultContactContent.address),
    mapEmbedUrl: pickString(record.mapEmbedUrl, defaultContactContent.mapEmbedUrl),
    email: typeof record.email === "string" ? record.email.trim() : defaultContactContent.email,
  };
}

export function toTelHref(phone: string) {
  const normalized = toEnDigits(phone).replace(/[^\d+]/g, "");
  if (!normalized) {
    return "#";
  }

  if (normalized.startsWith("+")) {
    return `tel:${normalized}`;
  }

  if (normalized.startsWith("98")) {
    return `tel:+${normalized}`;
  }

  if (normalized.startsWith("0")) {
    return `tel:+98${normalized.slice(1)}`;
  }

  return `tel:${normalized}`;
}
