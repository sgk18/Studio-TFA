import Image from "next/image";
import Link from "next/link";

import { resolveDisplayPrice } from "@/lib/commerce";
import { createClient } from "@/utils/supabase/server";
import { formatINR } from "@/lib/currency";
import { resolveViewerRole } from "@/lib/security/viewerRole";
import { cn } from "@/lib/utils";
import {
  deriveMaterial,
  isRecord,
  matchesPriceRanges,
  readFirstString,
  resolveProductCategory,
  toNumber,
  toSlug,
  uniqueSlugs,
} from "@/lib/catalogFilters";

interface ProductGridProps {
  categorySlug: string;
  selectedCategories: string[];
  selectedPriceRanges: string[];
  selectedMaterials: string[];
}

type ProductCard = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  price: number;
  material: string;
  story: string;
  isCustomOrder: boolean;
};

export async function ProductGrid({
  categorySlug,
  selectedCategories,
  selectedPriceRanges,
  selectedMaterials,
}: ProductGridProps) {
  const supabase = await createClient();
  const [{ data }, viewerRole] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false }),
    resolveViewerRole(supabase),
  ]);

  const cards = (Array.isArray(data) ? data : [])
    .map((item) => toProductCard(item, viewerRole.isWholesale))
    .filter((item): item is ProductCard => item !== null);

  const normalizedCategoryFilters = uniqueSlugs(selectedCategories);
  const normalizedMaterialFilters = uniqueSlugs(selectedMaterials);
  const normalizedPriceFilters = uniqueSlugs(selectedPriceRanges);

  const filteredCards = cards.filter((card) => {
    const categorySlugForCard = toSlug(card.category);
    const materialSlugForCard = toSlug(card.material);

    if (
      normalizedCategoryFilters.length > 0 &&
      !normalizedCategoryFilters.includes(categorySlugForCard)
    ) {
      return false;
    }

    if (
      normalizedMaterialFilters.length > 0 &&
      !normalizedMaterialFilters.includes(materialSlugForCard)
    ) {
      return false;
    }

    if (!matchesPriceRanges(toNumber(card.price), normalizedPriceFilters)) {
      return false;
    }

    return true;
  });

  if (filteredCards.length === 0) {
    return (
      <div className="glass-shell rounded-[1.6rem] p-8 text-center md:p-12">
        <p className="text-base text-foreground/75">
          No pieces match these filters yet. Try widening your selection.
        </p>
        <Link
          href={categorySlug === "all" ? "/collections" : `/collections/${categorySlug}`}
          className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.18em] text-primary underline underline-offset-4"
        >
          Reset filters
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-6 lg:gap-8">
      {filteredCards.map((product, index) => {
        const isFeatureCard = index % 7 === 0;
        const cardSpan = isFeatureCard ? "md:col-span-4" : "md:col-span-3";
        const mediaAspect = isFeatureCard ? "aspect-[5/6]" : "aspect-[3/4]";

        return (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className={cn(
              "group block glass-shell rounded-[1.4rem] p-4 transition-transform hover:-translate-y-1",
              cardSpan
            )}
          >
            <div
              className={cn(
                "relative mb-5 overflow-hidden rounded-xl border border-border/70 bg-card/65",
                mediaAspect
              )}
            >
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
                    {product.category}
                  </p>
                  <h3 className="mt-2 font-heading text-3xl leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {product.title}
                  </h3>
                </div>

                <p className="shrink-0 text-sm font-bold uppercase tracking-[0.15em] text-primary">
                  {product.isCustomOrder ? "Custom Order" : formatINR(product.price)}
                </p>
              </div>

              <p className="line-clamp-2 text-sm leading-relaxed text-foreground/72">
                {product.story}
              </p>

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                Material: {product.material}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function toProductCard(value: unknown, isWholesale: boolean): ProductCard | null {
  if (!isRecord(value)) return null;

  const id = readFirstString(value, ["id"]);
  const title = readFirstString(value, ["title"]);
  const imageUrl = readFirstString(value, ["image_url"]);
  const category = resolveProductCategory(value);
  const material = deriveMaterial(value);
  const story =
    readFirstString(value, ["story", "description", "inspiration"]) ||
    "Crafted to anchor your space in meaning and beauty.";

  const isCustomOrder = Boolean(value.is_custom_order);
  const basePrice = toNumber(value.price);

  if (!id || !title || !imageUrl) return null;

  return {
    id,
    title,
    category,
    imageUrl,
    price: resolveDisplayPrice(basePrice, isWholesale),
    material,
    story,
    isCustomOrder,
  };
}
