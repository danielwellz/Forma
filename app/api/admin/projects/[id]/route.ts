import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user || !hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "EDITOR"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.projectMedia.deleteMany({ where: { projectId: id } });

    return tx.project.update({
      where: { id },
      data: {
        slug: data.slug,
        titleFa: data.titleFa,
        titleEn: data.titleEn,
        category: data.category,
        locationFa: data.locationFa,
        year: data.year,
        areaSqm: data.areaSqm,
        scopeFa: data.scopeFa,
        servicesProvided: data.servicesProvided,
        descriptionFa: data.descriptionFa,
        featured: data.featured,
        published: data.published,
        coverImageUrl: data.coverImageUrl,
        metaTitleFa: data.metaTitleFa,
        metaDescriptionFa: data.metaDescriptionFa,
        media: data.media?.length
          ? {
              createMany: {
                data: data.media,
              },
            }
          : undefined,
      },
    });
  });

  revalidateTag("projects", "max");

  return NextResponse.json({ id: updated.id });
}
