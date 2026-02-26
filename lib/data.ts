import { unstable_cache } from "next/cache";
import { Prisma, ProjectCategory, ServiceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const projectSelect = {
  id: true,
  slug: true,
  titleFa: true,
  titleEn: true,
  category: true,
  locationFa: true,
  year: true,
  areaSqm: true,
  scopeFa: true,
  servicesProvided: true,
  descriptionFa: true,
  metaTitleFa: true,
  metaDescriptionFa: true,
  featured: true,
  published: true,
  coverImageUrl: true,
  media: { orderBy: { order: "asc" as const } },
} satisfies Prisma.ProjectSelect;

const basePublishedWhere: Prisma.ProjectWhereInput = {
  published: true,
};

const getPublishedProjectsCached = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: basePublishedWhere,
      select: projectSelect,
      orderBy: [{ featured: "desc" }, { year: "desc" }, { createdAt: "desc" }],
    }),
  ["published-projects"],
  {
    revalidate: 300,
    tags: ["projects"],
  },
);

const getProjectBySlugCached = unstable_cache(
  async (slug: string) =>
    prisma.project.findFirst({
      where: { slug, published: true },
      select: projectSelect,
    }),
  ["project-by-slug"],
  {
    revalidate: 300,
    tags: ["projects"],
  },
);

const getFeaturedProjectsCached = unstable_cache(
  async (limit: number) =>
    prisma.project.findMany({
      where: { published: true, featured: true },
      select: projectSelect,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: limit,
    }),
  ["featured-projects"],
  {
    revalidate: 300,
    tags: ["projects"],
  },
);

const getContentBlocksCached = unstable_cache(
  async () => prisma.contentBlock.findMany(),
  ["content-blocks"],
  {
    revalidate: 300,
    tags: ["content"],
  },
);

export async function getPublishedProjects(filters?: {
  category?: ProjectCategory;
  year?: number;
  service?: ServiceType;
  query?: string;
}) {
  if (!filters?.category && !filters?.year && !filters?.service && !filters?.query) {
    return getPublishedProjectsCached();
  }

  const where: Prisma.ProjectWhereInput = {
    published: true,
  };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.year) {
    where.year = filters.year;
  }

  if (filters.service) {
    where.servicesProvided = { has: filters.service };
  }

  if (filters.query) {
    where.OR = [
      { titleFa: { contains: filters.query, mode: "insensitive" } },
      { locationFa: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  return prisma.project.findMany({
    where,
    select: projectSelect,
    orderBy: [{ featured: "desc" }, { year: "desc" }, { createdAt: "desc" }],
  });
}

export async function getProjectBySlug(slug: string) {
  return getProjectBySlugCached(slug);
}

export async function getFeaturedProjects(limit = 6) {
  return getFeaturedProjectsCached(limit);
}

export async function getContentMap() {
  const blocks = await getContentBlocksCached();
  return blocks.reduce<Record<string, Prisma.JsonValue>>((acc, block) => {
    acc[block.key] = block.contentFa;
    return acc;
  }, {});
}
