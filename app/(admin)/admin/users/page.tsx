import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { roleLabelsFa } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN"], "/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>کاربران</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="grid gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm md:grid-cols-3">
            <p className="font-medium text-stone-900">{user.name}</p>
            <p className="text-stone-700">{user.email}</p>
            <p className="text-stone-600">{roleLabelsFa[user.role]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
