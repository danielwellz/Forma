import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { ProjectGallery } from "@/components/shared/project-gallery";
import { ProjectCard } from "@/components/shared/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { projectCategoryLabelsFa, serviceTypeLabelsFa } from "@/lib/constants";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data";
import { toFaDigits } from "@/lib/jalali";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "پروژه یافت نشد",
      description: "این پروژه در حال حاضر در دسترس نیست.",
      alternates: { canonical: `/portfolio/${slug}` },
    };
  }

  const description = project.metaDescriptionFa ?? project.descriptionFa.slice(0, 160);
  const title = project.metaTitleFa ?? `${project.titleFa} | نمونه‌کار فرما`;

  return {
    title,
    description,
    alternates: {
      canonical: `/portfolio/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "fa_IR",
      url: `/portfolio/${slug}`,
      images: [
        {
          url: project.coverImageUrl,
          alt: project.titleFa,
        },
      ],
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const related = (await getPublishedProjects({ category: project.category }))
    .filter((item) => item.id !== project.id)
    .slice(0, 3);

  const gallery = [
    {
      type: "IMAGE" as const,
      url: project.coverImageUrl,
      altFa: `${project.titleFa} - تصویر شاخص`,
    },
    ...project.media.map((media, index) => ({
      type: media.type,
      url: media.url,
      altFa: media.altFa || `${project.titleFa} - رسانه ${toFaDigits(index + 1)}`,
    })),
  ];

  const estimateHref = `/portal/requests/new?type=ESTIMATE&sourceProjectId=${project.id}&sourceProjectTitle=${encodeURIComponent(
    project.titleFa,
  )}&sourceProjectLocation=${encodeURIComponent(project.locationFa)}&sourceProjectYear=${project.year}`;

  return (
    <Container className="py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{project.titleFa}</h1>
            <p className="mt-3 text-stone-600">
              {project.locationFa} - {toFaDigits(project.year)} - {toFaDigits(project.areaSqm)} مترمربع
            </p>
          </div>

          <ProjectGallery media={gallery} />

          <article className="prose-fa rounded-2xl border border-stone-200 bg-white p-5 text-stone-700">
            {project.descriptionFa}
          </article>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-24 border-forma-100">
            <CardContent className="space-y-4 pt-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{projectCategoryLabelsFa[project.category]}</Badge>
                {project.servicesProvided.map((service) => (
                  <Badge key={service} variant="outline">
                    {serviceTypeLabelsFa[service]}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2 rounded-xl bg-forma-50 p-3 text-sm text-stone-700">
                <p>
                  <span className="font-medium">موقعیت:</span> {project.locationFa}
                </p>
                <p>
                  <span className="font-medium">سال:</span> {toFaDigits(project.year)}
                </p>
                <p>
                  <span className="font-medium">متراژ:</span> {toFaDigits(project.areaSqm)} مترمربع
                </p>
                <p>
                  <span className="font-medium">دامنه پروژه:</span> {project.scopeFa}
                </p>
                <p>
                  <span className="font-medium">خدمات:</span>{" "}
                  {project.servicesProvided.map((service) => serviceTypeLabelsFa[service]).join("، ")}
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href={estimateHref}>درخواست برآورد برای پروژه مشابه</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-semibold">پروژه‌های مرتبط</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ProjectCard key={item.id} project={item} />
          ))}
        </div>
      </section>
    </Container>
  );
}
