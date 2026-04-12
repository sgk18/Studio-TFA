import { createClient } from "@/utils/supabase/server";
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
  comment: string | null;
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

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidPageIdParam(id)) notFound();

  const supabase = await createClient();
  const [{ data: productRaw }, { data: { user } }, { data: reviewsRaw }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profiles(full_name)')
      .eq('product_id', id)
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
  const primaryImage = galleryImages[0];

  if (!primaryImage) {
    notFound();
  }

  const reviews = (Array.isArray(reviewsRaw) ? reviewsRaw : [])
    .map((review) => toReviewCard(review))
    .filter((review): review is ReviewCard => review !== null);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const isCustomOrder = Boolean(product.is_custom_order);
  const displayPrice = resolveDisplayPrice(Number(product.price ?? 0), isWholesale);

  return (
    <article className="min-h-screen px-6 pb-24 pt-32 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <Link href="/collections" className="action-pill-link mb-12 inline-flex">
          ← Back to Gallery
        </Link>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:gap-12">
          <ScrollReveal direction="right">
            <div className="space-y-4">
              <div className="glass-shell rounded-[1.6rem] p-4 md:p-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/70 bg-card/55">
                  <Image
                    src={primaryImage}
                    alt={productTitle}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>

              {galleryImages.length > 1 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {galleryImages.slice(1).map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="glass-shell rounded-[1.15rem] p-2.5"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border/70 bg-card/50">
                        <Image
                          src={imageUrl}
                          alt={`${productTitle} detail ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 45vw, 20vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.1}>
            <div className="glass-shell rounded-[1.6rem] p-7 md:sticky md:top-28 md:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {productCategory}
              </p>
              <h1 className="mt-4 font-heading text-5xl tracking-tight md:text-6xl">
                {productTitle}
              </h1>

              {reviews.length > 0 ? (
                <div className="mt-7 flex items-center gap-3 rounded-full border border-border/70 bg-card/45 px-4 py-2">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/60">
                    {avgRating.toFixed(1)} / 5 · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </span>
                </div>
              ) : null}

              <div className="mt-10 border-l-2 border-primary/45 pl-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/55">
                  Inspiration
                </p>
                <p className="mt-3 font-heading text-3xl leading-tight text-primary md:text-4xl">
                  “{inspiration}”
                </p>
              </div>

              <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/75">
                {story}
              </p>

              <div className="mt-10 flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-3xl font-light">
                  {isCustomOrder ? "Custom Order" : formatINR(displayPrice)}
                </p>
                <AddToCartButton
                  product={{
                    id,
                    title: productTitle,
                    price: Number(product.price ?? 0),
                    image_url: primaryImage,
                    category: productCategory,
                  }}
                />
              </div>

              {isWholesale && !isCustomOrder ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Wholesale price applied (30% off list).
                </p>
              ) : null}

              <div className="mt-9 border-t border-border pt-7">
                <Accordion multiple={false} className="w-full">
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.18em] hover:no-underline hover:text-primary transition-colors">
                      Shipping & Logistics
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 text-sm leading-relaxed text-foreground/72">
                      We ship pan-India with premium packaging. Standard delivery takes 5-7 business days.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="returns">
                    <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.18em] hover:no-underline hover:text-primary transition-colors">
                      Returns & Exchanges
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 text-sm leading-relaxed text-foreground/72">
                      We accept returns only for damaged deliveries. Please contact support within 48 hours of receiving your order.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </ScrollReveal>
        </div>

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
                  <div key={review.id} className="glass-subpanel rounded-xl p-5">
                    <div className="mb-3 flex items-start justify-between gap-4">
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
                    {review.comment ? (
                      <p className="mt-3 text-sm leading-relaxed text-foreground/72">{review.comment}</p>
                    ) : (
                      <p className="mt-3 text-sm italic text-foreground/45">
                        Shared a rating without comment.
                      </p>
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

  if (!id || !createdAt || !Number.isFinite(rating)) {
    return null;
  }

  return {
    id,
    createdAt,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment,
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
