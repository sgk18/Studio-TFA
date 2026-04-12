import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StaggeredText } from "@/components/StaggeredText";
import { ParallaxImage } from "@/components/ParallaxImage";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { EditorialHero } from "@/components/EditorialHero";
import { sanitizeProductCards } from "@/lib/pageValidation";
import { formatINR } from "@/lib/currency";

export const metadata = {
  title: "Studio TFA | Narrative Christian Art",
  description: "To create elegant, boldly minimalist, Christ-centred art and lifestyle products that nurture identity and spark conversations."
};

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').limit(3);
  const featuredProducts = sanitizeProductCards(products).slice(0, 3);
  const shopCategories = [
    { label: "Books", href: "/collections/books" },
    { label: "Journals", href: "/collections/journals" },
    { label: "Home Decor", href: "/collections/home-decor" },
    { label: "Gift Hampers", href: "/collections/gift-hampers" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <EditorialHero />

      {/* The Mission */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <div className="glass-shell rounded-[2rem] p-8 md:p-12">
              <h2 className="text-xs tracking-[0.2em] uppercase font-bold text-primary mb-12">The Mission</h2>
              <StaggeredText 
                text="To serve creatives through powerful, intentional designs and meaningful products that carry the message of Christ into everyday life."
                className="font-heading text-3xl md:text-5xl lg:text-6xl leading-snug md:leading-tight text-foreground"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="glass-shell rounded-[2rem] p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs tracking-[0.22em] uppercase font-bold text-primary mb-3">Shop By Category</p>
                  <h2 className="font-heading text-4xl md:text-5xl tracking-tight">Start your order journey</h2>
                </div>
                <Link href="/collections" className="action-pill-link">
                  View Full Catalog
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {shopCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="glass-subpanel rounded-xl p-5 min-h-28 flex items-end font-heading text-2xl hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Brand Values - Horizontal Scroll */}
      <HorizontalScroll title="Core Values">
        {[
          { title: "Christ First, Always", text: "The source of our creativity, purpose, and standard." },
          { title: "Identity & Inner Healing", text: "We create to restore. Every product reminds you of who you are in Christ." },
          { title: "Excellence in the Details", text: "From materials to messages, we pursue beauty with intentionality." },
          { title: "Community over Competition", text: "We celebrate collaboration and support creatives in their God-given callings." },
          { title: "Purposeful Simplicity", text: "Bold, minimal, heartfelt. We let truth speak louder than trends." }
        ].map((val, idx) => (
          <div key={idx} className="w-[85vw] md:w-[45vw] flex-shrink-0 flex flex-col justify-center h-[68vh] glass-subpanel rounded-[1.5rem] p-8 md:p-12">
            <h3 className="font-heading text-4xl md:text-6xl mb-6">{val.title}</h3>
            <p className="text-xl md:text-2xl text-foreground/78 leading-relaxed font-light">{val.text}</p>
          </div>
        ))}
      </HorizontalScroll>

      {/* Story Journey - Scroll Stack */}
      <section className="py-28 md:py-36 px-6 bg-gradient-to-b from-background via-secondary/8 to-background">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-primary mb-4">Story Journey</p>
            <h2 className="font-heading text-4xl md:text-6xl leading-tight md:leading-[1.05] tracking-tight max-w-4xl">
              From scripture to space, each piece is designed to move your home toward hope.
            </h2>
          </ScrollReveal>

          <div className="mt-14 h-[88vh] min-h-[650px] rounded-[2rem] glass-shell overflow-hidden">
            <ScrollStack
              className="h-full"
              itemDistance={80}
              itemScale={0.025}
              itemStackDistance={26}
              stackPosition="18%"
              scaleEndPosition="8%"
              baseScale={0.9}
              scaleDuration={0.55}
              rotationAmount={-0.9}
              blurAmount={0.25}
            >
              <ScrollStackItem itemClassName="glass-subpanel border-border/70">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-5">01 | Revelation</p>
                <h3 className="font-heading text-3xl md:text-4xl leading-tight text-foreground mb-4">Truth First</h3>
                <p className="text-foreground/75 leading-relaxed md:text-lg max-w-2xl">
                  We begin with scripture and prayer, not trends. Every collection starts by asking what truth needs to be seen and remembered in daily life.
                </p>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="glass-subpanel border-border/70">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-5">02 | Design</p>
                <h3 className="font-heading text-3xl md:text-4xl leading-tight text-foreground mb-4">Meaningful Minimalism</h3>
                <p className="text-foreground/75 leading-relaxed md:text-lg max-w-2xl">
                  We shape typography, spacing, and form to make space for reflection. Quiet visuals, bold intent, and details that hold attention without noise.
                </p>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="glass-subpanel border-border/70">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-5">03 | Craft</p>
                <h3 className="font-heading text-3xl md:text-4xl leading-tight text-foreground mb-4">Built To Last</h3>
                <p className="text-foreground/75 leading-relaxed md:text-lg max-w-2xl">
                  From material choice to finish quality, we pursue excellence in the details so each object carries both beauty and durability into your everyday rhythm.
                </p>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="glass-subpanel border-border/70">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-5">04 | Presence</p>
                <h3 className="font-heading text-3xl md:text-4xl leading-tight text-foreground mb-4">A Home That Speaks Hope</h3>
                <p className="text-foreground/75 leading-relaxed md:text-lg max-w-2xl">
                  The final piece is not just decor, it is discipleship in plain sight: gentle reminders of identity, healing, and Christ-centered conversation.
                </p>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </section>

      {/* Featured Collection: Asymmetrical layout with sticky text */}
      <section className="py-32 px-6 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="glass-shell rounded-[2rem] p-8 md:p-10 mb-16">
              <h2 className="text-4xl md:text-5xl font-heading text-center">Featured Works</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 items-start">
            {/* Sticky Sidebar */}
            <div className="md:col-span-4 md:sticky md:top-40 h-auto">
              <ScrollReveal direction="left">
                <div className="glass-shell rounded-[1.5rem] p-7 md:p-8">
                  <h3 className="text-3xl font-heading mb-6 tracking-tight">The Gallery</h3>
                  <p className="text-foreground/70 leading-relaxed mb-8">
                    Our latest collection draws inspiration from the silent moments of dawn and the deeply rooted strength of ancient oaks.
                  </p>
                  <Link href="/collections" className="inline-flex items-center text-sm font-bold tracking-widest uppercase text-primary hover:text-foreground transition-colors group">
                    <span className="mr-2">Explore the exhibition</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Scrolling Images with Parallax */}
            <div className="md:col-span-8 space-y-32 mt-16 md:mt-0">
              {featuredProducts.length === 0 ? (
                <div className="glass-shell rounded-2xl p-8 text-center">
                  <p className="text-sm text-foreground/70 mb-4">
                    Featured works are being curated right now.
                  </p>
                  <Link
                    href="/collections"
                    className="inline-flex items-center text-xs tracking-widest uppercase font-bold text-primary hover:text-foreground transition-colors"
                  >
                    Browse full collection
                  </Link>
                </div>
              ) : (
                featuredProducts.map((product) => (
                  <ScrollReveal key={product.id} direction="up" delay={0.1}>
                    <Link href={`/product/${product.id}`} className="block group glass-shell rounded-[1.5rem] p-4 md:p-5 hover:-translate-y-1 transition-transform">
                      <div className="aspect-[4/5] md:aspect-[3/4] mb-6 rounded-xl overflow-hidden">
                        <ParallaxImage
                          src={product.image_url}
                          alt={product.title}
                        />
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-heading text-2xl mb-2 group-hover:text-primary transition-colors">{product.title}</h4>
                          <p className="text-sm text-foreground/60 tracking-wider uppercase">{product.category}</p>
                        </div>
                        <p className="font-medium">{formatINR(product.price)}</p>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <NewsletterPopup />
    </div>
  );
}
