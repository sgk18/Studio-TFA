import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ParallaxImage } from "@/components/ParallaxImage";
import { resolveDisplayPrice } from "@/lib/commerce";
import { sanitizeProductCards } from "@/lib/pageValidation";
import { formatINR } from "@/lib/currency";
import { resolveViewerRole } from "@/lib/security/viewerRole";

// Thematic map matching the requested brand palette
const categoryThemes: Record<string, { accentClass: string, name: string, description: string }> = {
  "books": { accentClass: "text-[#786825]", name: "Books", description: "Narratives of faith, deeply bound." },
  "journals": { accentClass: "text-[#8B263E]", name: "Journals", description: "Pages for reflection and revelation." },
  "apparels": { accentClass: "text-[#292800]", name: "Apparels", description: "Wearable declarations of truth." },
  "home-decor": { accentClass: "text-[#D17484]", name: "Home Decor", description: "Objects that architect peace." },
  "stationeries-and-accessories": { accentClass: "text-[#D17484]", name: "Stationeries & Accessories", description: "Intentional tools for everyday grace." },
  "gift-hampers": { accentClass: "text-[#8B263E]", name: "Gift Hampers", description: "Curated collections of purpose." },
  "custom-orders": { accentClass: "text-[#786825]", name: "Custom Orders", description: "Commissioned pieces for your unique story." },
  "artists-corner": { accentClass: "text-[#8B263E]", name: "Artists Corner", description: "Behind the veil of creation." }
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const theme = categoryThemes[category];
  return {
    title: theme ? `${theme.name} | Studio TFA` : "Category | Studio TFA",
    description: theme?.description || "Browse our narrative collections."
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const theme = categoryThemes[category];

  if (!theme) {
    notFound();
  }

  const supabase = await createClient();
  // Filter by the human-readable category name stored in the DB
  const [{ data: products }, viewerRole] = await Promise.all([
    supabase.from("products").select("*").eq("category", theme.name),
    resolveViewerRole(supabase),
  ]);
  const validatedProducts = sanitizeProductCards(products as any).map((product) => ({
    ...product,
    price: resolveDisplayPrice(Number(product.price) || 0, viewerRole.isWholesale),
  }));


  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 transition-colors duration-700">
      <div className="container mx-auto max-w-7xl flex-1">
        <ScrollReveal>
          <header className="mb-16 text-center mt-12 glass-shell rounded-[2rem] p-8 md:p-12">
            <h1 className={`font-heading text-5xl md:text-8xl mb-6 tracking-tight ${theme.accentClass}`}>
              {theme.name}
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/78 leading-relaxed font-light">
              {theme.description}
            </p>
          </header>
        </ScrollReveal>

        {validatedProducts.length === 0 ? (
          <div className="glass-shell rounded-2xl p-10 text-center max-w-2xl mx-auto">
            <p className="text-foreground/80 mb-4">No products available in this category yet.</p>
            <Link
              href="/collections"
              className="inline-flex items-center text-xs tracking-widest uppercase font-bold underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              View all collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {validatedProducts.map((product, idx) => (
              <ScrollReveal key={product.id} direction="up" delay={idx * 0.1}>
                <Link href={`/product/${product.id}`} className="block group glass-shell rounded-[1.5rem] p-4 md:p-5 hover:-translate-y-1 transition-transform">
                  <div className="relative aspect-[3/4] bg-card/55 rounded-xl mb-6 overflow-hidden">
                    <ParallaxImage
                      src={product.image_url}
                      alt={product.title}
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className={`font-heading text-2xl mb-2 group-hover:opacity-80 transition-opacity ${theme.accentClass}`}>
                        {product.title}
                      </h2>
                      <p className="text-xs tracking-[0.2em] text-foreground/60 uppercase font-bold">
                        {product.category}
                      </p>
                    </div>
                    <p className="font-light text-lg text-foreground/92">{formatINR(product.price)}</p>
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
