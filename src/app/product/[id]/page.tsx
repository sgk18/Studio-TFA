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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('title, category').eq('id', id).single();
  return {
    title: product ? `${product.title} | Studio TFA` : "Product | Studio TFA",
    description: product ? `Discover the intentional design behind ${product.title}.` : ""
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

  if (!product) {
    notFound();
  }

  return (
    <article className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-background">
      <div className="container mx-auto max-w-7xl">
        <Link href="/collections" className="inline-flex items-center text-xs tracking-widest uppercase font-bold text-foreground/50 hover:text-foreground transition-colors mb-16">
          ← Back to Gallery
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <ScrollReveal direction="right">
            <div className="relative aspect-[3/4] w-full bg-muted">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </ScrollReveal>

          <div className="flex flex-col justify-center lg:py-12">
            <ScrollReveal direction="left" delay={0.2}>
              <h1 className="font-heading text-5xl md:text-6xl tracking-tight mb-4">{product.title}</h1>
              <p className="text-xs tracking-[0.2em] text-foreground/50 uppercase font-bold mb-16">{product.category}</p>

              <div className="prose prose-lg text-foreground/80 mb-16">
                <p className="leading-relaxed font-heading italic text-3xl text-primary font-normal">
                  "{product.inspiration}"
                </p>
                <div className="h-px w-16 bg-border my-10" />
                <p className="leading-relaxed text-lg whitespace-pre-line">
                  {product.story}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-10 border-t border-border mt-auto">
                <p className="text-3xl font-light mb-8 sm:mb-0">${product.price}</p>
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
      </div>
    </article>
  );
}
