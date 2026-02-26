import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { AnalyticsScripts } from "@/components/shared/analytics-scripts";
import { Providers } from "@/components/providers";
import { APP_SITE_NAME } from "@/lib/constants";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const siteDescription =
  "فرما، گروه طراحی و ساخت برای پروژه‌های لوکس معماری، دکوراسیون داخلی، بازسازی و فضاهای بیرونی.";

export const metadata: Metadata = {
  title: {
    default: APP_SITE_NAME,
    template: `%s | ${APP_SITE_NAME}`,
  },
  description: siteDescription,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: APP_SITE_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: APP_SITE_NAME,
    description: siteDescription,
    siteName: APP_SITE_NAME,
    locale: "fa_IR",
    type: "website",
    url: "/",
    images: [
      {
        url: "/1.jpg",
        width: 360,
        height: 360,
        alt: APP_SITE_NAME,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} min-h-screen bg-forma-50 text-stone-900 antialiased`}>
        <Providers>{children}</Providers>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
