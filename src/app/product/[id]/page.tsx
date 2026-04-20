import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "@/components/StarRating";
import { UploadPhotoReviewForm } from "@/components/UploadPhotoReviewForm";
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
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidPageIdParam(id)) {
    return {
      title: "Product | Studio TFA",
      description: "",
    };
  }

  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('title, category').eq('id', id).single();
  return {
    title:
      product && typeof product.title === "string"
        ? `${product.title} | Studio TFA`
        : "Product | Studio TFA",
    description:
      product && typeof product.title === "string"
        ? `Discover the intentional design behind ${product.title}.`
        : "",
  };
}

import { ProductDetailsClient } from "@/components/ProductDetailsClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidPageIdParam(id)) notFound();

  const supabase = await createClient();
  const adminClient = createAdminClient();
  const [{ data: productRaw }, { data: { user } }, { data: reviewsRaw }] = await Promise.all([
    adminClient.from('products').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
    adminClient
      .from('reviews')
      .select('id, rating, title, comment, admin_reply, admin_reply_at, created_at, profiles(full_name)')
      .eq('product_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),
  ]);

  if (!isRecord(productRaw)) {
    notFound();
  }

  const role = user ? await resolveRoleForUserId(supabase, user.id) : null;
  const isWholesale = isWholesaleRole(role);

  const product = productRaw;
  const productTitle = readFirstString(product, ["title"]) || "Untitled Product";
  const productCategory = resolveProductCategory(product);
  const story =
    readFirstString(product, ["story", "description"]) ||
    "This piece is currently being prepared with a full editorial description.";
  const inspiration =
    readFirstString(product, ["inspiration"]) ||
    "A quiet invitation to remember truth through beauty and daily presence.";

  const galleryImages = extractProductGallery(product);

  const reviews = (Array.isArray(reviewsRaw) ? reviewsRaw : [])
    .map((review) => toReviewCard(review))
    .filter((review): review is ReviewCard => review !== null);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const displayPrice = resolveDisplayPrice(Number(product.price ?? 0), isWholesale);

  const productData = {
    id,
    title: productTitle,
    price: Number(product.price ?? 0),
    category: productCategory,
    story,
    inspiration,
    is_customisable: Boolean(product.is_customisable),
    customisable_fields: product.customisable_fields,
    images: galleryImages,
  };

  return (
    <article className="min-h-screen px-6 pb-24 pt-32 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <Link href="/collections" className="action-pill-link mb-12 inline-flex">
          ← Back to Gallery
        </Link>

        <ProductDetailsClient 
          product={productData}
          isWholesale={isWholesale}
          displayPrice={displayPrice}
          avgRating={avgRating}
          reviewCount={reviews.length}
        />

        <section className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-[1.07fr_0.93fr]">
          <div className="glass-shell rounded-[1.6rem] p-6 md:p-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Community
                </p>
                <h2 className="mt-3 font-heading text-4xl tracking-tight md:text-5xl">
                  Customer Reviews
                </h2>
              </div>
              <Link href="/community" className="action-pill-link px-4 py-2 text-xs">
                Open Gallery
              </Link>
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {reviews.map((review) => (
                  <div key={review.id} className="glass-subpanel rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-bold text-foreground/90">{review.reviewerName}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/45">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size={15} />
                    {review.title && (
                      <p className="text-sm font-semibold text-foreground/85">{review.title}</p>
                    )}
                    {review.comment ? (
                      <p className="text-sm leading-relaxed text-foreground/72">{review.comment}</p>
                    ) : (
                      <p className="text-sm italic text-foreground/45">
                        Shared a rating without comment.
                      </p>
                    )}
                    {review.adminReply && (
                      <div className="rounded-xl border border-primary/15 bg-[rgba(224,174,186,0.1)] px-4 py-3 border-l-2 border-l-primary">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-1.5">
                          Response from Sherlin ✦
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{review.adminReply}</p>
                        {review.adminReplyAt && (
                          <p className="text-[10px] text-foreground/40 mt-1">
                            Replied{" "}
                            {new Date(review.adminReplyAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-foreground/48">
                No reviews yet. Be the first to share your experience.
              </p>
            )}
          </div>

          <div>
            {user ? (
              <UploadPhotoReviewForm productId={id} />
            ) : (
              <div className="glass-shell rounded-[1.4rem] p-7 text-center">
                <p className="text-sm text-foreground/65">
                  Sign in to upload your photo review and share how this piece lives in your space.
                </p>
                <Link href="/login" className="action-pill-link mt-5 px-4 py-2 text-xs">
                  Sign In To Review
                </Link>
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

  if (!id || !createdAt || !Number.isFinite(rating)) {
    return null;
  }

  return {
    id,
    createdAt,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    title,
    comment,
    adminReply,
    adminReplyAt,
    reviewerName: resolveReviewerName(value.profiles),
  };
}

function resolveReviewerName(profiles: unknown): string {
  if (isRecord(profiles)) {
    const profileName = readFirstString(profiles, ["full_name"]);
    if (profileName) return profileName;
  }

  if (Array.isArray(profiles)) {
    const firstProfile = profiles[0];
    if (isRecord(firstProfile)) {
      const profileName = readFirstString(firstProfile, ["full_name"]);
      if (profileName) return profileName;
    }
  }

  return "Anonymous";
}
