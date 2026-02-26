import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { hasAnyRole } from "@/lib/permissions";

export async function requireAuth(redirectTo = "/auth/signin") {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect(redirectTo);
  }

  return session.user;
}

export async function requireRole(roles: Role[], redirectTo = "/") {
  const user = await requireAuth();
  if (!hasAnyRole(user.role as Role, roles)) {
    redirect(redirectTo);
  }

  return user;
}
