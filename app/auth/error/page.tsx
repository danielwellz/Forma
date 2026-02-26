import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full border-forma-100 shadow-lg">
        <CardHeader className="space-y-3">
          <BrandLogo className="justify-center" imageClassName="h-12" />
          <CardTitle className="text-center">خطا در ورود</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-stone-700">
          <p>احراز هویت انجام نشد. لطفا دوباره تلاش کنید.</p>
          <Link href="/auth/signin" className="text-forma-800 underline">
            بازگشت به ورود
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
