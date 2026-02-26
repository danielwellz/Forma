import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { contentBlockSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user || !hasAnyRole(session.user.role, ["SUPER_ADMIN", "ADMIN", "EDITOR"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contentBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const block = await prisma.contentBlock.upsert({
    where: { key: parsed.data.key },
    create: parsed.data,
    update: {
      contentFa: parsed.data.contentFa,
      contentEn: parsed.data.contentEn,
    },
  });

  revalidateTag("content", "max");

  return NextResponse.json({ id: block.id });
}
