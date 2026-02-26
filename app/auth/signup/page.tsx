import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SignUpForm } from "@/components/forms/signup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full border-forma-100 shadow-lg">
        <CardHeader className="space-y-3">
          <BrandLogo className="justify-center" imageClassName="h-14" priority />
          <CardTitle className="text-center">ثبت‌نام در فرما</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <p className="mt-4 text-sm text-stone-600">
            حساب دارید؟ <Link className="font-medium text-forma-800 underline" href="/auth/signin">ورود</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
