import type { Metadata } from "next";
import { Bodoni_Moda, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/LenisProvider";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { CartDrawer } from "@/components/CartDrawer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { createClient } from "@/lib/supabase/server";
import { resolveViewerRole } from "@/lib/security/viewerRole";
import { CartSync } from "@/components/CartSync";
import { AuthListener } from "@/components/AuthListener";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { siteConfig } from "@/config/site";

const bodoni = Bodoni_Moda({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{
      url: siteConfig.ogImage,
      width: 1200,
      height: 630,
      alt: siteConfig.name,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@studiotfa",
  },
};


import { CategoryThemeProvider } from "@/components/CategoryThemeProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { Suspense } from "react";
import Loading from "./loading";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { isWholesale, isAdmin, userId } = await resolveViewerRole(supabase);
  const isAuthenticated = Boolean(userId);

  return (
    <html lang="en" className={`${bodoni.variable} ${plusJakartaSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <GoogleAnalytics />
        <LenisProvider>
          <CategoryThemeProvider>
            <CustomCursor />
            <div className="relative flex min-h-dvh flex-col">
              <Navbar
                isWholesale={isWholesale}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
              />
              <main className="flex-1">
                <Suspense fallback={<Loading />}>
                  {children}
                </Suspense>
              </main>
              <Footer />
            </div>
            <CartDrawer isWholesale={isWholesale} />
            <WhatsAppFloat />
            <CookieConsentBanner />
            <CartSync />
            <AuthListener />
          </CategoryThemeProvider>
        </LenisProvider>
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
