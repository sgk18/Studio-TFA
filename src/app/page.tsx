import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StaggeredText } from "@/components/StaggeredText";
import { ParallaxImage } from "@/components/ParallaxImage";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { NewsletterPopup } from "@/components/NewsletterPopup";

export const metadata = {
  title: "Studio TFA | Narrative Christian Art",
  description: "To create elegant, boldly minimalist, Christ-centred art and lifestyle products that nurture identity and spark conversations."
};

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').limit(3);
  const featuredProducts = products || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Parallax Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParallaxImage 
            src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Studio TFA Vision" 
            priority
          />
          <div className="absolute inset-0 bg-background/90" /> {/* Ambient overlay */}
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-20">
          <StaggeredText 
            text="To create elegant, boldly minimalist, Christ-centred art and lifestyle products that nurture identity, spark conversations, and infuse homes with beauty and purpose."
            className="font-heading text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.15] text-foreground"
          />
        </div>
      </section>

      {/* The Mission */}
      <section className="py-32 px-6 bg-secondary/10">
        <div className="container mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <h2 className="text-xs tracking-[0.2em] uppercase font-bold text-primary mb-12">The Mission</h2>
            <StaggeredText 
              text="To serve creatives through powerful, intentional designs and meaningful products that carry the message of Christ into everyday life."
              className="font-heading text-3xl md:text-5xl lg:text-6xl leading-snug md:leading-tight text-foreground"
            />
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
          <div key={idx} className="w-[85vw] md:w-[45vw] flex-shrink-0 flex flex-col justify-center h-full border-l border-background/20 pl-8 md:pl-16">
            <h3 className="font-heading text-4xl md:text-6xl mb-6">{val.title}</h3>
            <p className="text-xl md:text-2xl text-background/70 leading-relaxed font-light">{val.text}</p>
          </div>
        ))}
      </HorizontalScroll>

      {/* Featured Collection: Asymmetrical layout with sticky text */}
      <section className="py-32 px-6 bg-background relative z-20">
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-heading mb-24 text-center">Featured Works</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 items-start">
            {/* Sticky Sidebar */}
            <div className="md:col-span-4 md:sticky md:top-40 h-auto">
              <ScrollReveal direction="left">
                <h3 className="text-3xl font-heading mb-6 tracking-tight">The Gallery</h3>
                <p className="text-foreground/70 leading-relaxed mb-8">
                  Our latest collection draws inspiration from the silent moments of dawn and the deeply rooted strength of ancient oaks.
                </p>
                <Link href="/collections" className="inline-flex items-center text-sm font-bold tracking-widest uppercase text-primary hover:text-foreground transition-colors group">
                  <span className="mr-2">Explore the exhibition</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </ScrollReveal>
            </div>

            {/* Scrolling Images with Parallax */}
            <div className="md:col-span-8 space-y-32 mt-16 md:mt-0">
              {featuredProducts.map((product, idx) => (
                <ScrollReveal key={product.id} direction="up" delay={0.1}>
                  <Link href={`/product/${product.id}`} className="block group">
                    <div className="aspect-[4/5] md:aspect-[3/4] mb-6">
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
                      <p className="font-medium">${product.price}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NewsletterPopup />
    </div>
  );
}
