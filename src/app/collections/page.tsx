import { createClient } from "@/utils/supabase/server";
import { ScrollReveal } from "@/components/ScrollReveal";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "The Gallery | Studio TFA",
};

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-background flex flex-col">
      <div className="container mx-auto max-w-7xl flex-1">
        <ScrollReveal>
          <header className="mb-24 text-center">
            <h1 className="font-heading text-5xl md:text-7xl mb-6 tracking-tight">The Gallery</h1>
            <p className="max-w-2xl mx-auto text-lg text-foreground/70 leading-relaxed">
              Browse our complete collection of intentional, narrative-driven pieces. Every object has a story to tell.
            </p>
          </header>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {products?.map((product, idx) => (
            <ScrollReveal key={product.id} direction="up" delay={idx * 0.1}>
              <Link href={`/product/${product.id}`} className="block group">
                <div className="relative aspect-[3/4] bg-muted mb-6 overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-heading text-2xl mb-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h2>
                    <p className="text-xs tracking-[0.2em] text-foreground/50 uppercase font-bold">
                      {product.category}
                    </p>
                  </div>
                  <p className="font-light text-lg">${product.price}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
