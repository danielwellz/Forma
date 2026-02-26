import { Role } from "@prisma/client";

export const adminRoles: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "SALES"];
export const cmsRoles: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
export const salesRoles: Role[] = ["SUPER_ADMIN", "ADMIN", "SALES"];

export function hasAnyRole(role: Role | undefined, allowed: Role[]) {
  if (!role) {
    return false;
  }

  return allowed.includes(role);
}
