import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export function DashboardLayout({
  title,
  nav,
  children,
}: {
  title: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-forma-50 pb-10">
      <header className="border-b border-forma-100 bg-white">
        <Container className="flex h-18 items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <BrandLogo imageClassName="h-11" />
            </Link>
            <h1 className="text-lg font-semibold text-forma-900">{title}</h1>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">بازگشت به سایت</Link>
          </Button>
        </Container>
      </header>
      <Container className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-forma-100 bg-white p-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-stone-700 transition hover:bg-forma-50 hover:text-forma-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </Container>
    </div>
  );
}
