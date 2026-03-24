import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Studio TFA | Christian Art & Home Decor — Kothanur, Bangalore",
    template: "%s | Studio TFA",
  },
  description:
    "Studio TFA is a Christian creative studio in Kothanur, Bangalore, crafting intentional, boldly minimalist art and lifestyle products. Books, journals, apparels, home decor and more.",
  keywords: [
    "Christian art Bangalore",
    "Christian home decor India",
    "Studio TFA",
    "faith-based products Kothanur",
    "Christian lifestyle brand",
    "Christian journals India",
    "Christian books Bangalore",
  ],
  authors: [{ name: "Studio TFA", url: "https://studiotfa.com" }],
  openGraph: {
    title: "Studio TFA | Christian Art & Home Decor",
    description: "Intentional, Christ-centred art and lifestyle products from Kothanur, Bangalore.",
    siteName: "Studio TFA",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio TFA | Christian Art & Home Decor",
    description: "Intentional, Christ-centred art and lifestyle products. Kothanur, Bangalore.",
  },
  robots: { index: true, follow: true },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <WhatsAppFloat />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
