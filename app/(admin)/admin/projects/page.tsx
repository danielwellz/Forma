import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { cmsRoles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { projectCategoryLabelsFa } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminProjectsPage() {
  await requireRole(cmsRoles, "/admin");

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>مدیریت پروژه‌ها</CardTitle>
        <Button asChild>
          <Link href="/admin/projects/new">پروژه جدید</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-stone-900">{project.titleFa}</p>
              <p className="text-xs text-stone-600">{projectCategoryLabelsFa[project.category]} - {project.locationFa}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={project.published ? "success" : "outline"}>{project.published ? "منتشر" : "پیش‌نویس"}</Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/projects/${project.id}/edit`}>ویرایش</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
