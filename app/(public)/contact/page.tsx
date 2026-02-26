import { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveContactContent, resolveHeroContent, toTelHref } from "@/lib/content";
import { getContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "اطلاعات تماس گروه طراحی و ساخت فرما و فرم ثبت پیام برای شروع همکاری.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "تماس با فرما",
    description: "ثبت درخواست مشاوره یا برآورد پروژه در فرما.",
    locale: "fa_IR",
    type: "website",
    url: "/contact",
  },
};

export const revalidate = 300;

export default async function ContactPage() {
  const content = await getContentMap();
  const contact = resolveContactContent(content.contact);
  const hero = resolveHeroContent(content.homepage_hero);

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold text-stone-900">تماس با {hero.companyNameFa}</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>راه‌های ارتباطی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-stone-700">
            <div>
              <p className="font-medium text-stone-900">تلفن‌های تماس</p>
              <div className="mt-1 space-y-1">
                {contact.phones.map((phone) => (
                  <a key={phone} className="block text-forma-800 underline" href={toTelHref(phone)}>
                    {phone}
                  </a>
                ))}
              </div>
            </div>
            <p>
              <span className="font-medium text-stone-900">ساعت کاری:</span> {contact.workingHours}
            </p>
            <p>
              <span className="font-medium text-stone-900">آدرس:</span> {contact.address}
            </p>
            <p>
              <span className="font-medium text-stone-900">اینستاگرام:</span>{" "}
              <a className="text-forma-800 underline" href={contact.instagramUrl} target="_blank" rel="noreferrer">
                {contact.instagramHandle}
              </a>
            </p>
            {contact.email ? (
              <p>
                <span className="font-medium text-stone-900">ایمیل:</span>{" "}
                <a className="text-forma-800 underline" href={`mailto:${contact.email}`} dir="ltr">
                  {contact.email}
                </a>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ارسال پیام</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-forma-100 bg-white">
        <iframe
          title="map"
          src={contact.mapEmbedUrl}
          className="h-[360px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </Container>
  );
}
