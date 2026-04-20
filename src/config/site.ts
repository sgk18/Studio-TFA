/**
 * Studio TFA - Site Configuration
 * Centralized settings for SEO, Analytics, and Social Branding.
 */

export const siteConfig = {
  name: "Studio TFA",
  description: "Christ-centered, intentional art and lifestyle products that nurture identity and spark conversations.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://studiotfa.com",
  ogImage: "https://studiotfa.com/og-image.png", // Ensure this exists in public/
  links: {
    instagram: "https://instagram.com/studio.tfa",
    whatsapp: "https://wa.me/your-number",
  },
  analytics: {
    google: process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX", // Replace with real ID in env
  },
  seo: {
    defaultTitle: "Studio TFA ✦ Intentional Art & Lifestyle",
    titleTemplate: "%s | Studio TFA",
  }
};

export type SiteConfig = typeof siteConfig;
