import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SignInForm } from "@/components/forms/signin-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/portal";

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full border-forma-100 shadow-lg">
        <CardHeader className="space-y-3">
          <BrandLogo className="justify-center" imageClassName="h-14" priority />
          <CardTitle className="text-center">ورود به فرما</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm callbackUrl={callbackUrl} />
          <p className="mt-4 text-sm text-stone-600">
            حساب ندارید؟ <Link className="font-medium text-forma-800 underline" href="/auth/signup">ثبت‌نام</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
