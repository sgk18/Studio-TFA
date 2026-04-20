import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StarRating } from "@/components/StarRating";
import { GalleryReviewForm } from "@/components/GalleryReviewForm";
import { checkProductPurchaseAction } from "@/app/product/actions";
import {
  extractProductGallery,
  isRecord,
  readFirstString,
  resolveProductCategory,
} from "@/lib/catalogFilters";
import { isWholesaleRole, resolveDisplayPrice } from "@/lib/commerce";
import { isValidPageIdParam } from "@/lib/pageValidation";
import { formatINR } from "@/lib/currency";
import { resolveRoleForUserId } from "@/lib/security/viewerRole";
import { ProductDetailsClient } from "@/components/ProductDetailsClient";
import { ShoppingBag, Lock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

type ReviewCard = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
  reviewerName: string;
  isVerified: boolean;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidPageIdParam(id)) return { title: "Product | Studio TFA" };

  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('title, category').eq('id', id).single();
  return {
    title: product?.title ? `${product.title} | Studio TFA` : "Product | Studio TFA",
    description: product?.title ? `Discover the intentional design behind ${product.title}.` : "",
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidPageIdParam(id)) notFound();

  const supabase = await createClient();
  const [{ data: productRaw }, { data: { user } }, { data: reviewsRaw }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
    supabase
      .from('reviews')
      .select('id, rating, title, comment, admin_reply, admin_reply_at, created_at, is_verified, profiles(full_name)')
      .eq('product_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),
  ]);

  if (!isRecord(productRaw)) notFound();

  const product = productRaw;
  const role = user ? await resolveRoleForUserId(supabase, user.id) : null;
  const isWholesale = isWholesaleRole(role);
  const displayPrice = resolveDisplayPrice(Number(product.price ?? 0), isWholesale);
  
  const hasPurchased = user ? await checkProductPurchaseAction(id) : false;

  const reviews = (Array.isArray(reviewsRaw) ? reviewsRaw : [])
    .map((review) => toReviewCard(review))
    .filter((review): review is ReviewCard => review !== null);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const productData = {
    id,
    title: String(product.title || "Untitled"),
    price: Number(product.price ?? 0),
    category: resolveProductCategory(product),
    story: String(product.story || product.description || "Preparing description..."),
    inspiration: String(product.inspiration || "Truth through beauty."),
    is_customisable: Boolean(product.is_customisable),
    customisable_fields: product.customisable_fields,
    images: extractProductGallery(product),
  };

  return (
    <article className="min-h-screen px-6 pb-24 pt-32 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <Link href="/collections" className="action-pill-link mb-12 inline-flex">
          ← Back to Collections
        </Link>

        <ProductDetailsClient 
          product={productData}
          isWholesale={isWholesale}
          displayPrice={displayPrice}
          avgRating={avgRating}
          reviewCount={reviews.length}
        />

        <section className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.85fr]">
          {/* Reviews List */}
          <div className="glass-shell rounded-[2.5rem] p-8 md:p-10 border-none bg-card/10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Testimonials</p>
                <h2 className="mt-3 font-heading text-5xl tracking-tight">Community Voice</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/45 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Verified Reviews
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="glass-subpanel rounded-[1.8rem] p-6 md:p-8 space-y-4 border-none bg-card/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {review.reviewerName.split(' ')[0][0]}{review.reviewerName.split(' ')[1]?.[0] || ''}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground/90">{review.reviewerName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} size={13} />
                            <span className="text-[10px] text-foreground/40 font-medium">Verified Gallery Purchase</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/45 italic">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                      </p>
                    </div>

                    <div className="pl-1 space-y-2">
                      {review.title && <h4 className="text-base font-semibold text-foreground/85">{review.title}</h4>}
                      <p className="text-[14px] leading-relaxed text-foreground/72">{review.comment || "Rated without comment."}</p>
                    </div>

                    {review.adminReply && (
                      <div className="mt-4 rounded-2xl border-l-[3px] border-primary bg-[rgba(224,174,186,0.12)] p-6 transition-all hover:bg-[rgba(224,174,186,0.18)]">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Response from Sherlin ✦</p>
                        </div>
                        <p className="text-[14px] text-foreground/80 leading-relaxed italic">"{review.adminReply}"</p>
                        {review.adminReplyAt && (
                          <p className="text-[10px] text-foreground/40 mt-3 font-medium uppercase tracking-[0.1em]">
                            Replied on {new Date(review.adminReplyAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag className="h-10 w-10 text-foreground/10 mb-4" />
                <p className="text-sm italic text-foreground/40">No reflections shared yet. Be the first to grace this page.</p>
              </div>
            )}
          </div>

          {/* Review Submission Form */}
          <div className="lg:sticky lg:top-32 h-fit">
            {!user ? (
              <div className="glass-shell rounded-[2rem] p-8 text-center border-none bg-card/45">
                <Lock className="h-10 w-10 text-primary/30 mx-auto mb-4" />
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Sign in to share how this piece lives in your space and your faith journey.
                </p>
                <Link href="/login" className="mt-6 flex items-center justify-center rounded-full bg-primary py-3.5 px-8 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:bg-primary/90">
                  Sign In To Review
                </Link>
              </div>
            ) : hasPurchased ? (
              <GalleryReviewForm productId={id} />
            ) : (
              <div className="glass-shell rounded-[2rem] p-8 text-center border-none bg-card/45">
                <ShoppingBag className="h-10 w-10 text-primary/30 mx-auto mb-4" />
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Only verified collectors of this piece can share a reflection in the gallery.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Purchase required to Review
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

function toReviewCard(value: unknown): ReviewCard | null {
  if (!isRecord(value)) return null;

  const id = readFirstString(value, ["id"]);
  const createdAt = readFirstString(value, ["created_at"]);
  const rating = Number(value.rating);
  const comment = typeof value.comment === "string" ? value.comment : null;
  const title = typeof value.title === "string" ? value.title : null;
  const adminReply = typeof value.admin_reply === "string" ? value.admin_reply : null;
  const adminReplyAt = typeof value.admin_reply_at === "string" ? value.admin_reply_at : null;
  const isVerified = Boolean(value.is_verified);

  if (!id || !createdAt || !Number.isFinite(rating)) return null;

  return {
    id,
    createdAt,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    title,
    comment,
    adminReply,
    adminReplyAt,
    isVerified,
    reviewerName: resolveReviewerName(value.profiles),
  };
}

function resolveReviewerName(profiles: unknown): string {
  let fullName = "Anonymous Collector";

  if (isRecord(profiles)) {
    fullName = readFirstString(profiles, ["full_name"]) || fullName;
  } else if (Array.isArray(profiles)) {
    const first = profiles[0];
    if (isRecord(first)) {
      fullName = readFirstString(first, ["full_name"]) || fullName;
    }
  }

  const parts = fullName.split(' ');
  if (parts.length > 1) {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName[0]}.`;
  }
  
  return fullName;
}
