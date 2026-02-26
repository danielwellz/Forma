import { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveServicesContent } from "@/lib/content";
import { getContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "خدمات",
  description: "خدمات فرما در حوزه مشاوره، طراحی، بازسازی، دکوراسیون داخلی و فضاهای بیرونی به صورت یکپارچه ارائه می‌شود.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "خدمات فرما",
    description: "معرفی خدمات تخصصی گروه طراحی و ساخت فرما.",
    locale: "fa_IR",
    type: "website",
    url: "/services",
  },
};

export const revalidate = 300;

export default async function ServicesPage() {
  const content = await getContentMap();
  const services = resolveServicesContent(content.services);

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold text-stone-900">خدمات گروه طراحی و ساخت فرما</h1>
      <p className="mt-4 max-w-4xl text-stone-700 leading-8">
        خدمات فرما با رویکرد طراحی-ساخت تعریف می‌شود؛ یعنی تصمیم‌های طراحی، فنی و اجرایی از ابتدا هم‌راستا پیش می‌روند تا خروجی پروژه دقیق، قابل اجرا و قابل کنترل باشد.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {services.items.map((service) => (
          <Card key={service.title} className="border-forma-100">
            <CardHeader>
              <CardTitle className="text-forma-900">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-stone-700">
              <p>{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-10 border-forma-100 bg-forma-50/50">
        <CardContent className="pt-5 text-sm leading-8 text-stone-700">{services.extraText}</CardContent>
      </Card>
    </Container>
  );
}
