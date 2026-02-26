import {
  AboutContentForm,
  ContactContentForm,
  HeroContentForm,
  ServicesContentForm,
} from "@/components/forms/cms-content-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  resolveAboutContent,
  resolveContactContent,
  resolveHeroContent,
  resolveServicesContent,
} from "@/lib/content";
import { getContentMap } from "@/lib/data";
import { requireRole } from "@/lib/auth-guards";
import { cmsRoles } from "@/lib/permissions";

export default async function AdminContentPage() {
  await requireRole(cmsRoles, "/admin");

  const content = await getContentMap();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>خانه - هدر اصلی</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroContentForm initial={resolveHeroContent(content.homepage_hero)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>درباره ما</CardTitle>
        </CardHeader>
        <CardContent>
          <AboutContentForm initial={resolveAboutContent(content.about)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>خدمات</CardTitle>
        </CardHeader>
        <CardContent>
          <ServicesContentForm initial={resolveServicesContent(content.services)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات تماس</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactContentForm initial={resolveContactContent(content.contact)} />
        </CardContent>
      </Card>
    </div>
  );
}
