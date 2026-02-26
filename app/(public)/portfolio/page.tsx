import { Suspense } from "react";
import { Metadata } from "next";
import { ProjectCategory, ServiceType } from "@prisma/client";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/shared/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { projectCategoryLabelsFa, serviceTypeLabelsFa } from "@/lib/constants";
import { getPublishedProjects } from "@/lib/data";
import { toEnDigits, toFaDigits } from "@/lib/jalali";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = typeof params.category === "string" ? (params.category as ProjectCategory) : undefined;
  const query = typeof params.q === "string" ? params.q : undefined;
  const categoryLabel = category ? projectCategoryLabelsFa[category] : "همه دسته‌ها";

  const title = query ? `نمونه‌کارها - ${categoryLabel} - ${query}` : `نمونه‌کارهای فرما - ${categoryLabel}`;
  const description = "نمونه‌پروژه‌های منتشرشده فرما در معماری، طراحی داخلی، بازسازی و طراحی-ساخت.";

  return {
    title,
    description,
    alternates: {
      canonical: "/portfolio",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fa_IR",
      url: "/portfolio",
    },
  };
}

function PortfolioGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function PortfolioResults({
  category,
  year,
  service,
  query,
}: {
  category?: ProjectCategory;
  year?: number;
  service?: ServiceType;
  query?: string;
}) {
  const projects = await getPublishedProjects({ category, year, service, query });

  if (!projects.length) {
    return <EmptyState title="پروژه‌ای یافت نشد" description="فیلترها را تغییر دهید یا جستجو را پاک کنید." />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? (params.category as ProjectCategory) : undefined;
  const yearRaw = typeof params.year === "string" ? toEnDigits(params.year) : undefined;
  const year = yearRaw ? Number(yearRaw) : undefined;
  const service = typeof params.service === "string" ? (params.service as ServiceType) : undefined;
  const query = typeof params.q === "string" ? params.q : undefined;

  const suspenseKey = [category ?? "", service ?? "", query ?? "", Number.isFinite(year) ? year : ""].join("|");

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold text-stone-900">نمونه‌کارها</h1>
      <p className="mt-4 text-stone-700">پروژه‌های منتشرشده فرما را با فیلترهای حرفه‌ای بررسی کنید.</p>

      <form className="mt-8 grid gap-3 rounded-2xl border border-forma-100 bg-white p-4 shadow-sm md:grid-cols-5">
        <Select name="category" defaultValue={category ?? ""}>
          <option value="">دسته‌بندی</option>
          {Object.entries(projectCategoryLabelsFa).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <input
          name="year"
          defaultValue={year ? toFaDigits(year) : ""}
          placeholder="سال"
          className="h-10 rounded-xl border border-stone-300 px-3 text-sm focus-visible:border-forma-500 focus-visible:outline-none"
          inputMode="numeric"
        />
        <Select name="service" defaultValue={service ?? ""}>
          <option value="">خدمات</option>
          {Object.entries(serviceTypeLabelsFa).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <input
          name="q"
          defaultValue={query ?? ""}
          placeholder="جستجو عنوان/موقعیت"
          className="h-10 rounded-xl border border-stone-300 px-3 text-sm focus-visible:border-forma-500 focus-visible:outline-none"
        />
        <button className="h-10 rounded-xl bg-forma-700 px-3 text-sm font-medium text-white hover:bg-forma-800">اعمال فیلتر</button>
      </form>

      <div className="mt-8">
        <Suspense key={suspenseKey} fallback={<PortfolioGridSkeleton />}>
          <PortfolioResults
            category={category}
            year={Number.isFinite(year) ? year : undefined}
            service={service}
            query={query}
          />
        </Suspense>
      </div>
    </Container>
  );
}
