import { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveAboutContent } from "@/lib/content";
import { getContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "معرفی گروه طراحی و ساخت فرما و رویکرد حرفه‌ای این مجموعه در طراحی و اجرای پروژه‌های معماری.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "درباره گروه طراحی و ساخت فرما",
    description: "آشنایی با استودیوی فرما و رویکرد آن در طراحی و ساخت.",
    locale: "fa_IR",
    type: "website",
    url: "/about",
  },
};

export const revalidate = 300;

export default async function AboutPage() {
  const content = await getContentMap();
  const about = resolveAboutContent(content.about);

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold text-stone-900">گروه طراحی و ساخت فرما</h1>
      <p className="mt-6 max-w-4xl text-base leading-8 text-stone-700">{about.intro}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>رویکرد طراحی</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-stone-700">
            تحلیل دقیق نیاز پروژه، تعریف مفهوم معماری و تبدیل آن به جزئیات قابل اجرا در تمام فازهای طراحی.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>کیفیت اجرا</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-stone-700">
            هماهنگی میان طراحی، تدارکات و اجرا برای کنترل کیفیت نهایی، زمان‌بندی پروژه و جلوگیری از دوباره‌کاری.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>مدیریت یکپارچه</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-stone-700">
            از مشاوره اولیه تا تحویل نهایی، تیم فرما فرآیند را شفاف و مرحله‌به‌مرحله با کارفرما پیش می‌برد.
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
