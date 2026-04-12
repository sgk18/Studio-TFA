import { createClient } from "@/utils/supabase/server";
import { ScrollReveal } from "@/components/ScrollReveal";
import Image from "next/image";
import Link from "next/link";
import { sanitizeProductCards } from "@/lib/pageValidation";
import { formatINR } from "@/lib/currency";
import { toSlug } from "@/lib/catalogFilters";

export const metadata = {
  title: "The Gallery | Studio TFA",
};

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');
  const validatedProducts = sanitizeProductCards(products);
  const categoryList = Array.from(
    new Set(
      validatedProducts
        .map((product) => product.category)
        .filter((category): category is string => category.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col">
      <div className="container mx-auto max-w-7xl flex-1">
        <ScrollReveal>
          <header className="mb-16 text-center glass-shell rounded-[2rem] p-8 md:p-12">
            <h1 className="font-heading text-5xl md:text-7xl mb-6 tracking-tight">The Gallery</h1>
            <p className="max-w-2xl mx-auto text-lg text-foreground/70 leading-relaxed">
              Browse our complete collection of intentional, narrative-driven pieces. Every object has a story to tell.
            </p>
            {categoryList.length > 0 ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                {categoryList.map((category) => (
                  <Link
                    key={category}
                    href={`/collections/${toSlug(category)}`}
                    className="rounded-full border border-border/75 bg-card/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            ) : null}
          </header>
        </ScrollReveal>

        {validatedProducts.length === 0 ? (
          <div className="glass-shell rounded-2xl p-10 text-center max-w-2xl mx-auto">
            <p className="text-foreground/70 mb-4">No products are available in the gallery right now.</p>
            <Link
              href="/"
              className="inline-flex items-center text-xs tracking-widest uppercase font-bold text-primary hover:text-foreground transition-colors"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {validatedProducts.map((product, idx) => (
              <ScrollReveal key={product.id} direction="up" delay={idx * 0.1}>
                <Link href={`/product/${product.id}`} className="block group glass-shell rounded-[1.5rem] p-4 md:p-5 hover:-translate-y-1 transition-transform">
                  <div className="relative aspect-[3/4] bg-card/50 rounded-xl mb-6 overflow-hidden">
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
                    <p className="font-light text-lg">{formatINR(product.price)}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
