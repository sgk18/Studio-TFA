import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";
import { isValidPageIdParam } from "@/lib/pageValidation";

export const dynamic = "force-dynamic";

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
    title: product ? `${product.title} | Studio TFA` : "Product | Studio TFA",
    description: product ? `Discover the intentional design behind ${product.title}.` : ""
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidPageIdParam(id)) notFound();
  
  const supabase = await createClient();
  const [{ data: product }, { data: { user } }, { data: reviews }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
    supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!product) notFound();

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <article className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <Link href="/collections" className="action-pill-link mb-16">
          ← Back to Gallery
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <ScrollReveal direction="right">
            <div className="glass-shell rounded-[1.75rem] p-4">
              <div className="relative aspect-[3/4] w-full bg-card/55 rounded-xl overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </ScrollReveal>

          <div className="glass-shell rounded-[1.75rem] p-7 md:p-10 flex flex-col justify-center lg:py-12">
            <ScrollReveal direction="left" delay={0.2}>
              <h1 className="font-heading text-5xl md:text-6xl tracking-tight mb-4">{product.title}</h1>
              <p className="text-xs tracking-[0.2em] text-foreground/50 uppercase font-bold mb-4">{product.category}</p>

              {/* Average Rating Badge */}
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-12">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="text-xs text-foreground/50 font-bold tracking-widest">
                    {avgRating.toFixed(1)} / 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div className="prose prose-lg text-foreground/80 mb-16">
                <p className="leading-relaxed font-heading italic text-3xl text-primary font-normal">
                  &ldquo;{product.inspiration}&rdquo;
                </p>
                <div className="h-px w-16 bg-border my-10" />
                <p className="leading-relaxed text-lg whitespace-pre-line">
                  {product.story}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-10 border-t border-border mt-auto">
                <p className="text-3xl font-light mb-8 sm:mb-0">₹{product.price}</p>
                <AddToCartButton product={product} />
              </div>

              <div className="mt-16 pt-8 border-t border-border">
                <Accordion multiple={false} className="w-full">
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-sm font-bold tracking-widest uppercase hover:no-underline hover:text-primary transition-colors">Shipping &amp; Logistics</AccordionTrigger>
                    <AccordionContent className="text-foreground/70 leading-relaxed text-base pt-4">
                      We ship pan-India. Standard delivery takes 5-7 business days. All items are carefully packaged to ensure they arrive in perfect condition.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="returns">
                    <AccordionTrigger className="text-sm font-bold tracking-widest uppercase hover:no-underline hover:text-primary transition-colors">Returns &amp; Exchanges</AccordionTrigger>
                    <AccordionContent className="text-foreground/70 leading-relaxed text-base pt-4">
                      Due to the intentional and often custom nature of our pieces, we do not accept returns unless the item arrives damaged.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ── Customer Reviews Section ──────────────────── */}
        <div className="mt-20 glass-shell rounded-[1.75rem] p-8 md:p-10">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">Community</p>
                <h2 className="font-heading text-4xl md:text-5xl tracking-tight">Customer Reviews</h2>
              </div>
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-4">
                  <StarRating rating={Math.round(avgRating)} size={22} />
                  <div>
                    <p className="font-heading text-3xl font-bold">{avgRating.toFixed(1)}</p>
                    <p className="text-xs text-foreground/50">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Review Form */}
            {user ? (
              <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50 mb-4">Leave a Review</p>
                <ReviewForm productId={id} />
              </div>
            ) : (
              <div className="mb-12 p-6 glass-subpanel border-dashed text-center rounded-xl">
                <p className="text-sm text-foreground/60 mb-3">Sign in to share your experience with this piece.</p>
                <Link href="/login" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-primary transition-colors">
                  Sign in to review
                </Link>
              </div>
            )}

            {/* Review List */}
            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((review: any) => (
                  <div key={review.id} className="glass-subpanel rounded-xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">
                        {(review.profiles as any)?.full_name ?? "Anonymous"}
                      </p>
                      <p className="text-xs text-foreground/40">
                        {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size={16} />
                    {review.comment && (
                      <p className="text-foreground/70 text-sm leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/40 text-sm italic">No reviews yet — be the first to share your thoughts.</p>
            )}
          </ScrollReveal>
        </div>

      </div>
    </article>
  );
}
