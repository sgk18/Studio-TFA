import { redirect } from "next/navigation";
import {
  AdminAnalyticsDashboard,
  type ProductAnalyticsRow,
  type ReviewAnalyticsRow,
} from "@/components/admin/AdminAnalyticsDashboard";
import { verifyMasterAdminAccess } from "@/lib/security/masterAdminServer";

export const metadata = {
  title: "Dashboard | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const access = await verifyMasterAdminAccess();
  if (!access.decision.allowed) {
    redirect(`/login?error=${encodeURIComponent(access.message)}&redirectedFrom=/admin`);
  }

  const supabase = access.supabase;

  const [{ data: productsRaw, error: productsError }, { data: reviewsRaw, error: reviewsError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, title, category, price, stock_count, is_custom_order, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("id, product_id, rating, comment, created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (productsError) {
    console.error("[admin dashboard] failed to fetch products", productsError);
  }

  if (reviewsError) {
    console.error("[admin dashboard] failed to fetch reviews", reviewsError);
  }

  const products = ((productsRaw ?? []) as ProductAnalyticsRow[]).map((product) => ({
    ...product,
    title: product.title || "Untitled Product",
  }));

  const productLookup = new Map(products.map((product) => [product.id, product]));

  const reviews = ((reviewsRaw ?? []) as Omit<ReviewAnalyticsRow, "product_title" | "product_category">[]).map(
    (review) => {
      const relatedProduct = review.product_id ? productLookup.get(review.product_id) : undefined;

      return {
        ...review,
        product_title: relatedProduct?.title || "Unknown Product",
        product_category: relatedProduct?.category || "Uncategorized",
      };
    }
  );

  return (
    <AdminAnalyticsDashboard products={products} reviews={reviews} />
  );
}
