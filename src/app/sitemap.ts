import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://studiotfa.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static routes
  const routes = [
    "",
    "/collections",
    "/about",
    "/journal",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${EXTERNAL_DATA_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch all categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id");

  const categoryRoutes = (categories || []).map((cat) => ({
    url: `${EXTERNAL_DATA_URL}/c/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch all products
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("is_archived", false);

  const productRoutes = (products || []).map((prod) => ({
    url: `${EXTERNAL_DATA_URL}/product/${prod.id}`,
    lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...routes, ...categoryRoutes, ...productRoutes];
}
