import { RequestType } from "@prisma/client";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { RequestForm } from "@/components/forms/request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuth();

  const params = await searchParams;
  const type = params.type === "CONSULTATION" ? RequestType.CONSULTATION : RequestType.ESTIMATE;
  const sourceProjectId = typeof params.sourceProjectId === "string" ? params.sourceProjectId : undefined;

  const [slots, sourceProject] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: {
        isBooked: false,
        startAt: { gte: new Date() },
      },
      orderBy: { startAt: "asc" },
      take: 30,
    }),
    sourceProjectId
      ? prisma.project.findUnique({
          where: { id: sourceProjectId },
          select: { id: true, titleFa: true, locationFa: true, year: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ثبت درخواست جدید</CardTitle>
      </CardHeader>
      <CardContent>
        <RequestForm
          initialType={type}
          sourceProject={sourceProject ? { ...sourceProject } : undefined}
          slots={slots.map((slot) => ({
            id: slot.id,
            startAt: slot.startAt.toISOString(),
            endAt: slot.endAt.toISOString(),
          }))}
        />
      </CardContent>
    </Card>
  );
}
