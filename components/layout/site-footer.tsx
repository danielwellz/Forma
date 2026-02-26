import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Container } from "@/components/shared/container";
import { resolveContactContent, resolveHeroContent, toTelHref } from "@/lib/content";
import { getContentMap } from "@/lib/data";

export async function SiteFooter() {
  const content = await getContentMap();
  const contact = resolveContactContent(content.contact);
  const hero = resolveHeroContent(content.homepage_hero);

  return (
    <footer className="mt-20 border-t border-forma-100 bg-forma-950 py-12 text-stone-100">
      <Container className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo imageClassName="h-14" />
          <p className="mt-4 text-sm text-stone-200">{hero.companyNameFa}</p>
          <p className="mt-2 text-sm text-stone-300">{hero.taglineFa}</p>
          <p className="text-xs text-stone-400" dir="ltr">{hero.taglineEn}</p>
        </div>

        <div className="space-y-3 text-sm text-stone-200">
          <p className="font-semibold text-white">دسترسی سریع</p>
          <div className="flex flex-col gap-2">
            <Link href="/about" className="transition hover:text-forma-200">درباره ما</Link>
            <Link href="/services" className="transition hover:text-forma-200">خدمات</Link>
            <Link href="/portfolio" className="transition hover:text-forma-200">نمونه‌کارها</Link>
            <Link href="/contact" className="transition hover:text-forma-200">تماس با ما</Link>
          </div>
        </div>

        <div className="space-y-3 text-sm text-stone-200">
          <p className="font-semibold text-white">راه‌های ارتباطی</p>
          <div className="space-y-1">
            {contact.phones.map((phone) => (
              <a key={phone} href={toTelHref(phone)} className="block transition hover:text-forma-200">
                {phone}
              </a>
            ))}
          </div>
          <p>{contact.workingHours}</p>
          <p>{contact.address}</p>
          <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex text-forma-200 hover:text-forma-100">
            {contact.instagramHandle}
          </a>
          {contact.email ? (
            <a href={`mailto:${contact.email}`} dir="ltr" className="block text-forma-200 hover:text-forma-100">
              {contact.email}
            </a>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
