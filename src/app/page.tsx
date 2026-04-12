import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StaggeredText } from "@/components/StaggeredText";
import { ParallaxImage } from "@/components/ParallaxImage";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { EditorialHero } from "@/components/EditorialHero";
import { resolveDisplayPrice } from "@/lib/commerce";
import { sanitizeProductCards } from "@/lib/pageValidation";
import { formatINR } from "@/lib/currency";
import { resolveViewerRole } from "@/lib/security/viewerRole";

export const metadata = {
  title: "Studio TFA | Narrative Christian Art",
  description: "To create elegant, boldly minimalist, Christ-centred art and lifestyle products that nurture identity and spark conversations."
};

export default async function Home() {
  const supabase = await createClient();
  const [{ data: products }, viewerRole] = await Promise.all([
    supabase.from("products").select("*").limit(3),
    resolveViewerRole(supabase),
  ]);
  const featuredProducts = sanitizeProductCards(products)
    .slice(0, 3)
    .map((product) => ({
      ...product,
      price: resolveDisplayPrice(Number(product.price) || 0, viewerRole.isWholesale),
    }));
  const shopCategories = [
    { label: "Books", href: "/collections/books" },
    { label: "Journals", href: "/collections/journals" },
    { label: "Home Decor", href: "/collections/home-decor" },
    { label: "Gift Hampers", href: "/collections/gift-hampers" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <EditorialHero />

      {/* The Mission — Sweeping Negative Space */}
      <section className="py-40 px-6 lg:py-56">
        <div className="container mx-auto max-w-5xl text-center">
          <ScrollReveal distance={48}>
            <div className="glass-shell rounded-[2.5rem] p-12 md:p-24 border-[0.5px] border-primary/20">
              <h2 className="overline mb-16">The Mission</h2>
              <StaggeredText 
                text="To serve creatives through powerful, intentional designs and meaningful products that carry the message of Christ into everyday life."
                className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-snug tracking-[-0.01em] text-foreground mx-auto max-w-4xl"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Start your order journey — Asymmetric, high-end borders */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="max-w-xl">
                <p className="overline mb-4">Shop By Category</p>
                <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-tight">Start your order journey</h2>
              </div>
              <Link href="/collections" className="action-pill-link">
                View Full Catalog
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shopCategories.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative glass-shell rounded-[1.8rem] px-8 pt-16 pb-8 min-h-[16rem] flex flex-col justify-end border-[0.5px] border-primary/20 transition-all duration-400 hover:-translate-y-2 hover:border-primary/50"
                  style={{
                    backgroundColor: index % 2 === 0 ? "rgba(253, 248, 244, 0.95)" : "rgba(224, 174, 186, 0.15)"
                  }}
                >
                  <p className="overline opacity-0 group-hover:opacity-100 transition-opacity mb-auto">Explore</p>
                  <h3 className="font-heading text-3xl group-hover:text-primary transition-colors">{item.label}</h3>
                  <div className="absolute right-8 bottom-8 opacity-0 transform translate-x-[-10px] transition-all duration-400 group-hover:opacity-100 group-hover:translate-x-0">
                    <span className="text-primary text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Brand Values - Horizontal Scroll (Editorial Style) */}
      <div className="my-24">
        <HorizontalScroll title="Core Values">
          {[
            { title: "Christ First, Always", text: "The source of our creativity, purpose, and standard." },
            { title: "Identity & Inner Healing", text: "We create to restore. Every product reminds you of who you are in Christ." },
            { title: "Excellence in the Details", text: "From materials to messages, we pursue beauty with intentionality." },
            { title: "Purposeful Simplicity", text: "Bold, minimal, heartfelt. We let truth speak louder than trends." }
          ].map((val, idx) => (
            <div key={idx} className="w-[85vw] md:w-[42vw] flex-shrink-0 flex flex-col justify-center h-[65vh] glass-shell rounded-[2rem] p-12 md:p-16 border-[0.5px] border-primary/20 mx-4">
              <p className="overline mb-6 opacity-60">Value 0{idx + 1}</p>
              <h3 className="font-heading text-4xl md:text-5xl leading-tight tracking-tight mb-8">{val.title}</h3>
              <p className="text-foreground/70 leading-relaxed text-lg max-w-sm">{val.text}</p>
            </div>
          ))}
        </HorizontalScroll>
      </div>

      {/* Story Journey - Scroll Stack with soft Cream backdrop */}
      <section className="py-32 md:py-48 px-6 bg-[#F9F3EE]/40 border-y border-border/40">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="overline mb-6">Story Journey</p>
            <h2 className="font-heading text-4xl md:text-6xl leading-tight md:leading-[1.05] tracking-[-0.01em] max-w-3xl">
              From scripture to space, each piece is designed to move your home toward hope.
            </h2>
          </ScrollReveal>

          <div className="mt-20 h-[85vh] min-h-[600px] rounded-[2.5rem] overflow-hidden border-[0.5px] border-primary/10">
            <ScrollStack
              className="h-full"
              itemDistance={80}
              itemScale={0.02}
              itemStackDistance={24}
              stackPosition="15%"
              scaleEndPosition="8%"
              baseScale={0.92}
              scaleDuration={0.65}
              rotationAmount={-0.6}
              blurAmount={0.3}
            >
              {[
                { step: "01", chapter: "Revelation", title: "Truth First", text: "We begin with scripture and prayer, not trends. Every collection starts by asking what truth needs to be seen and remembered in daily life." },
                { step: "02", chapter: "Design", title: "Meaningful Minimalism", text: "We shape typography, spacing, and form to make space for reflection. Quiet visuals, bold intent, and details that hold attention without noise." },
                { step: "03", chapter: "Craft", title: "Built To Last", text: "From material choice to finish quality, we pursue excellence in the details so each object carries both beauty and durability into your everyday rhythm." },
                { step: "04", chapter: "Presence", title: "A Home That Speaks", text: "The final piece is not just decor, it is discipleship in plain sight: gentle reminders of identity, healing, and Christ-centered conversation." },
              ].map((item) => (
                <ScrollStackItem key={item.step} itemClassName="glass-shell border-[0.5px] border-primary/20 bg-[rgba(253,248,244,0.95)]">
                  <p className="overline text-primary mb-8">{item.step} | {item.chapter}</p>
                  <h3 className="font-heading text-4xl md:text-5xl leading-tight text-foreground mb-6 tracking-tight">{item.title}</h3>
                  <p className="text-foreground/75 leading-relaxed md:text-lg max-w-2xl font-light">
                    {item.text}
                  </p>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </div>
      </section>

      {/* Featured Collection: Asymmetrical layout with sticky text */}
      <section className="py-40 px-6 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-28 items-start">
            
            {/* Sticky Sidebar */}
            <div className="md:col-span-5 md:sticky md:top-32 h-auto">
              <ScrollReveal direction="left">
                <div className="glass-shell rounded-[2rem] p-10 lg:p-14 border-[0.5px] border-primary/20 bg-[rgba(253,248,244,0.95)]">
                  <p className="overline mb-6">Exhibition</p>
                  <h3 className="font-heading text-5xl mb-8 tracking-[-0.01em] leading-none">Featured Works</h3>
                  <p className="text-foreground/70 leading-relaxed mb-12 text-lg">
                    Our latest releases draw inspiration from the silent moments of dawn and the deeply rooted strength of ancient faith.
                  </p>
                  <Link href="/collections" className="link-arrow text-sm">
                    Enter the gallery
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Scrolling Images with Parallax */}
            <div className="md:col-span-7 space-y-24 md:space-y-40 mt-20 md:mt-0 md:pt-32 pb-32">
              {featuredProducts.length === 0 ? (
                <div className="glass-shell rounded-[2rem] p-12 text-center border-[0.5px] border-primary/20">
                  <p className="text-foreground/60 mb-6 text-lg">
                    Featured works are being curated right now.
                  </p>
                  <Link href="/collections" className="link-arrow">
                    Browse full collection
                  </Link>
                </div>
              ) : (
                featuredProducts.map((product, i) => (
                  <ScrollReveal key={product.id} direction="up" delay={0.1} distance={60}>
                    <Link href={`/product/${product.id}`} className="block group product-card glass-shell rounded-[2rem] p-6 border-[0.5px] border-primary/20"
                          style={i % 2 === 1 ? { transform: "translateX(-2rem)" } : {}}>
                      <div className="aspect-[4/5] md:aspect-[3/4] mb-8 rounded-[1.2rem] overflow-hidden bg-[#Fdf8f4]">
                        <ParallaxImage src={product.image_url} alt={product.title} />
                      </div>
                      <div className="flex justify-between items-start pt-2 px-2">
                        <div className="pr-4">
                          <p className="overline text-foreground/50 mb-3">{product.category}</p>
                          <h4 className="font-heading text-3xl leading-tight mb-2 group-hover:text-primary transition-colors">{product.title}</h4>
                        </div>
                        <p className="font-bold uppercase tracking-[0.15em] text-primary pt-1 text-sm shrink-0">{formatINR(product.price)}</p>
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
