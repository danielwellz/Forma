import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/shared/container";
import { ProjectCard } from "@/components/shared/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveHeroContent, resolveServicesContent } from "@/lib/content";
import { getContentMap, getFeaturedProjects } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [featuredProjects, content] = await Promise.all([getFeaturedProjects(6), getContentMap()]);
  const hero = resolveHeroContent(content.homepage_hero);
  const services = resolveServicesContent(content.services);

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-forma-200 bg-forma-950 py-20 text-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-forma-200/20 blur-3xl" />
        <Container className="relative grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-sm text-forma-100">{hero.companyNameFa}</p>
            <h1 className="mt-4 text-4xl leading-[1.35] font-bold md:text-5xl">{hero.taglineFa}</h1>
            <p className="mt-3 text-sm text-stone-200" dir="ltr">
              {hero.taglineEn}
            </p>
            <p className="mt-6 max-w-xl text-base leading-8 text-stone-200">{hero.subtitleFa}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/portal/requests/new?type=ESTIMATE">درخواست برآورد</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/portal/requests/new?type=CONSULTATION">رزرو جلسه مشاوره</Link>
              </Button>
            </div>
          </div>
          <Card className="border-forma-300/20 bg-white/10 text-white backdrop-blur">
            <CardHeader>
              <CardTitle>خدمات اصلی فرما</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-stone-100">
              {services.items.map((item) => (
                <p key={item.title}>{item.title}</p>
              ))}
            </CardContent>
          </Card>
        </Container>
      </section>

      <Container className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-stone-900">پروژه‌های شاخص</h2>
          <Link href="/portfolio" className="inline-flex items-center gap-1 text-sm text-forma-800 hover:text-forma-900">
            مشاهده همه
            <ArrowLeft className="rtl-flip h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Container>

      <Container className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.items.map((item) => (
          <Card key={item.title} className="border-forma-100">
            <CardHeader>
              <CardTitle className="text-base text-forma-900">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-stone-600">{item.description}</CardContent>
          </Card>
        ))}
      </Container>
    </div>
  );
}
