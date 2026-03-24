import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ScrollReveal } from "@/components/ScrollReveal";
import Image from "next/image";
import Link from "next/link";
import { ParallaxImage } from "@/components/ParallaxImage";

// Thematic map matching the requested brand palette
const categoryThemes: Record<string, { bg: string, text: string, name: string, description: string }> = {
  "books": { bg: "bg-[#786825]", text: "text-[#FAFAFA]", name: "Books", description: "Narratives of faith, deeply bound." },
  "journals": { bg: "bg-[#8B263E]", text: "text-[#FAFAFA]", name: "Journals", description: "Pages for reflection and revelation." },
  "apparels": { bg: "bg-[#292800]", text: "text-[#FAFAFA]", name: "Apparels", description: "Wearable declarations of truth." },
  "home-decor": { bg: "bg-[#E0AEBA]", text: "text-[#292800]", name: "Home Decor", description: "Objects that architect peace." },
  "stationeries-and-accessories": { bg: "bg-[#D17484]", text: "text-[#FAFAFA]", name: "Stationeries & Accessories", description: "Intentional tools for everyday grace." },
  "gift-hampers": { bg: "bg-background", text: "text-foreground", name: "Gift Hampers", description: "Curated collections of purpose." },
  "custom-orders": { bg: "bg-[#786825]/10", text: "text-[#292800]", name: "Custom Orders", description: "Commissioned pieces for your unique story." },
  "artists-corner": { bg: "bg-foreground", text: "text-background", name: "Artists Corner", description: "Behind the veil of creation." }
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
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category', theme.name);


  return (
    <div className={`min-h-screen pt-32 pb-24 px-6 md:px-12 ${theme.bg} ${theme.text} transition-colors duration-700`}>
      <div className="container mx-auto max-w-7xl flex-1">
        <ScrollReveal>
          <header className="mb-24 text-center mt-12">
            <h1 className="font-heading text-5xl md:text-8xl mb-6 tracking-tight">{theme.name}</h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl opacity-80 leading-relaxed font-light">
              {theme.description}
            </p>
          </header>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {products?.map((product, idx) => (
            <ScrollReveal key={product.id} direction="up" delay={idx * 0.1}>
              <Link href={`/product/${product.id}`} className="block group">
                <div className="relative aspect-[3/4] bg-black/10 mb-6 overflow-hidden">
                   <ParallaxImage 
                     src={product.image_url} 
                     alt={product.title} 
                   />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-heading text-2xl mb-2 group-hover:opacity-70 transition-opacity">
                      {product.title}
                    </h2>
                    <p className="text-xs tracking-[0.2em] opacity-60 uppercase font-bold">
                      {product.category}
                    </p>
                  </div>
                  <p className="font-light text-lg opacity-90">${product.price}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
