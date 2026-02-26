import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { cmsRoles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/forms/project-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(cmsRoles, "/admin");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { media: true },
  });

  if (!project) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ویرایش پروژه</CardTitle>
      </CardHeader>
      <CardContent>
        <ProjectForm
          projectId={project.id}
          initial={{
            slug: project.slug,
            titleFa: project.titleFa,
            titleEn: project.titleEn ?? "",
            category: project.category,
            locationFa: project.locationFa,
            year: project.year,
            areaSqm: project.areaSqm,
            scopeFa: project.scopeFa,
            servicesProvided: project.servicesProvided,
            descriptionFa: project.descriptionFa,
            featured: project.featured,
            published: project.published,
            coverImageUrl: project.coverImageUrl,
            media: project.media.map((item) => ({
              url: item.url,
              altFa: item.altFa,
              type: item.type,
              order: item.order,
            })),
            metaTitleFa: project.metaTitleFa ?? "",
            metaDescriptionFa: project.metaDescriptionFa ?? "",
          }}
        />
      </CardContent>
    </Card>
  );
}
