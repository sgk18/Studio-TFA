import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdminAccess } from "@/lib/security/adminRole";
import { AdminReviewsTable, type AdminReviewRow } from "@/components/admin/AdminReviewsTable";
import { isRecord } from "@/lib/catalogFilters";

export const metadata: Metadata = {
  title: "Reviews | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

type FilterTab = "all" | "pending" | "approved" | "replied" | "awaiting";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending Approval" },
  { id: "approved", label: "Approved" },
  { id: "replied", label: "Replied" },
  { id: "awaiting", label: "Awaiting Reply" },
];

function ReviewsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-border/60 bg-card/40"
        />
      ))}
    </div>
  );
}

async function ReviewsContent({
  filter,
  page,
}: {
  filter: FilterTab;
  page: number;
}) {
  const { supabase } = await requireAdminAccess({ from: "/admin/reviews" });

  const PAGE_SIZE = 15;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("reviews")
    .select(
      "id, rating, title, comment, is_approved, admin_reply, admin_reply_at, created_at, product_id, profiles(full_name, email), products(title)"
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter === "pending") query = query.eq("is_approved", false);
  if (filter === "approved") query = query.eq("is_approved", true);
  if (filter === "replied") query = query.not("admin_reply", "is", null);
  if (filter === "awaiting") query = query.eq("is_approved", true).is("admin_reply", null);

  const { data: rawReviews, error } = await query;

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load reviews: {error.message}
      </p>
    );
  }

  const reviews: AdminReviewRow[] = (Array.isArray(rawReviews) ? rawReviews : [])
    .map((row) => {
      if (!isRecord(row)) return null;

      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const product = Array.isArray(row.products) ? row.products[0] : row.products;

      const reviewerName =
        isRecord(profile) && typeof profile.full_name === "string"
          ? profile.full_name
          : "Anonymous";
      const reviewerEmail =
        isRecord(profile) && typeof profile.email === "string"
          ? profile.email
          : "—";
      const productTitle =
        isRecord(product) && typeof product.title === "string"
          ? product.title
          : "Unknown Product";

      return {
        id: String(row.id),
        productId: String(row.product_id),
        productTitle,
        reviewerName,
        reviewerEmail,
        rating: Number(row.rating),
        title: typeof row.title === "string" ? row.title : null,
        comment: typeof row.comment === "string" ? row.comment : null,
        isApproved: Boolean(row.is_approved),
        adminReply: typeof row.admin_reply === "string" ? row.admin_reply : null,
        adminReplyAt: typeof row.admin_reply_at === "string" ? row.admin_reply_at : null,
        createdAt: String(row.created_at),
      } satisfies AdminReviewRow;
    })
    .filter((r): r is AdminReviewRow => r !== null);

  return <AdminReviewsTable reviews={reviews} />;
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawFilter = typeof params.filter === "string" ? params.filter : "all";
  const filter: FilterTab = (FILTER_TABS.some((t) => t.id === rawFilter)
    ? rawFilter
    : "all") as FilterTab;
  const page = Math.max(1, Number(params.page ?? 1));

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          Moderation
        </p>
        <h2 className="mt-2 font-heading text-5xl tracking-tight">Reviews</h2>
        <p className="mt-2 text-sm text-foreground/60 max-w-lg">
          Approve, reject, and reply to customer reviews. Approved reviews with a
          reply will show a "Response from Sherlin ✦" card on the product page.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = tab.id === filter;
          const url = new URLSearchParams({ filter: tab.id, page: "1" });
          return (
            <a
              key={tab.id}
              href={`/admin/reviews?${url.toString()}`}
              className={[
                "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/70 bg-card/40 text-foreground/65 hover:border-border hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Table */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsContent filter={filter} page={page} />
      </Suspense>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        {page > 1 ? (
          <a
            href={`/admin/reviews?filter=${filter}&page=${page - 1}`}
            className="action-pill-link px-4 py-2 text-xs"
          >
            ← Previous
          </a>
        ) : (
          <span />
        )}
        <span className="text-xs text-foreground/40 uppercase tracking-[0.14em]">
          Page {page}
        </span>
        <a
          href={`/admin/reviews?filter=${filter}&page=${page + 1}`}
          className="action-pill-link px-4 py-2 text-xs"
        >
          Next →
        </a>
      </div>
    </section>
  );
}
