import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { Container } from "@/components/shared/container";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SignOutButton } from "@/components/shared/signout-button";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await getServerAuthSession();

  const navItems = [
    { href: "/", label: "خانه" },
    { href: "/about", label: "درباره" },
    { href: "/services", label: "خدمات" },
    { href: "/portfolio", label: "نمونه‌کارها" },
    { href: "/contact", label: "تماس" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-forma-100/80 bg-white/92 backdrop-blur">
      <Container className="flex h-18 items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-6">
          <Link href="/" className="shrink-0">
            <BrandLogo priority imageClassName="h-12" />
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-stone-700 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-forma-800">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={session.user.role === "CLIENT" ? "/portal" : "/admin"}>
                  {session.user.role === "CLIENT" ? "پرتال" : "ادمین"}
                </Link>
              </Button>
              <SignOutButton />
            </>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/auth/signin">ورود</Link>
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
