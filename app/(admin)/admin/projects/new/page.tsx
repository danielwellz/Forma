import { requireRole } from "@/lib/auth-guards";
import { cmsRoles } from "@/lib/permissions";
import { ProjectForm } from "@/components/forms/project-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewProjectPage() {
  await requireRole(cmsRoles, "/admin");

  return (
    <Card>
      <CardHeader>
        <CardTitle>ایجاد پروژه</CardTitle>
      </CardHeader>
      <CardContent>
        <ProjectForm />
      </CardContent>
    </Card>
  );
}
