import Image from "next/image";
import Link from "next/link";
import { ProjectCategory, ServiceType } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { projectCategoryLabelsFa, serviceTypeLabelsFa } from "@/lib/constants";
import { toFaDigits } from "@/lib/jalali";

type ProjectCardProps = {
  project: {
    slug: string;
    titleFa: string;
    locationFa: string;
    year: number;
    category: ProjectCategory;
    coverImageUrl: string;
    servicesProvided: ServiceType[];
  };
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/portfolio/${project.slug}`}>
      <Card className="overflow-hidden border-forma-100 transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] bg-stone-200">
          <Image
            src={project.coverImageUrl}
            alt={project.titleFa}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="space-y-2 pt-4">
          <h3 className="text-base font-semibold text-stone-900">{project.titleFa}</h3>
          <p className="text-sm text-stone-600">
            {projectCategoryLabelsFa[project.category]} - {project.locationFa} - {toFaDigits(project.year)}
          </p>
          <p className="line-clamp-1 text-xs text-stone-500">
            {project.servicesProvided.map((service) => serviceTypeLabelsFa[service]).join("، ")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
