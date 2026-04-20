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
  title: {
    default: "Studio TFA | Headless E-Commerce",
    template: "%s | Studio TFA",
  },
  description:
    "Studio TFA is a headless e-commerce platform built for editorial, brand-led commerce experiences.",
  authors: [{ name: "Studio TFA" }],
  robots: { index: true, follow: true },
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
    <html lang="en" className={`${bodoni.variable} ${plusJakartaSans.variable} h-full antialiased`}>
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
          </CategoryThemeProvider>
        </LenisProvider>
        <Toaster />
      </body>
    </html>
  );
}
