import Image from "next/image";
import Link from "next/link";

import { resolveDisplayPrice } from "@/lib/commerce";
import { createAdminClient } from "@/lib/supabase/admin";
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
  sort?: string;
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
  sort = "featured",
}: ProductGridProps) {
  const supabase = createAdminClient();
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
  const normalizedPriceFilters    = uniqueSlugs(selectedPriceRanges);

  const filteredCards = cards.filter((product) => {
    // 1. Initial category slug match (from URL /collections/[category])
    if (categorySlug !== "all") {
      const productSlug = toSlug(product.category);
      if (productSlug !== categorySlug) return false;
    }

    // 2. Facet Sidebar: Category Filters
    if (normalizedCategoryFilters.length > 0) {
      const productSlug = toSlug(product.category);
      if (!normalizedCategoryFilters.includes(productSlug)) return false;
    }

    // 3. Facet Sidebar: Material Filters
    if (normalizedMaterialFilters.length > 0) {
      const productSlug = toSlug(product.material);
      if (!normalizedMaterialFilters.includes(productSlug)) return false;
    }

    // 4. Facet Sidebar: Price Filters
    if (normalizedPriceFilters.length > 0) {
      if (!matchesPriceRanges(product.price, normalizedPriceFilters)) return false;
    }

    return true;
  });

  // Apply sorting
  const sortedCards = [...filteredCards].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        // Since we don't have created_at on the card directly, 
        // we rely on the initial query order which is already DESC created_at.
        // If sorting by newest, we just keep the order.
        return 0; 
      default:
        return 0;
    }
  });

  if (sortedCards.length === 0) {
    return (
      <div className="glass-shell rounded-[1.6rem] p-12 text-center">
        <p className="text-foreground/65 mb-6" style={{ fontSize: "var(--type-lg)" }}>
          No pieces match these filters yet.
        </p>
        <Link
          href={categorySlug === "all" ? "/collections" : `/collections/${categorySlug}`}
          className="link-arrow"
        >
          Reset filters
        </Link>
      </div>
    );
  }

  return (
    /**
     * Asymmetrical editorial grid:
     * – Cards at position 0 mod 7 → wide feature (col-span-4), tall aspect
     * – Cards at position 3 mod 7 → medium accent (col-span-3), square-ish
     * – All others              → standard half-width (col-span-3)
     */
    <div className="grid grid-cols-1 gap-5 md:grid-cols-6 lg:gap-7">
      {sortedCards.map((product, index) => {
        const isFeature = index % 7 === 0;
        const isAccent  = index % 7 === 3;

        const cardSpan    = isFeature ? "md:col-span-4" : "md:col-span-3";
        const mediaAspect = isFeature ? "aspect-[4/5]"  : isAccent ? "aspect-[1/1]" : "aspect-[3/4]";

        return (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className={cn(
              "product-card group block glass-shell rounded-[1.4rem] p-4",
              cardSpan
            )}
          >
            {/* Image */}
            <div
              className={cn(
                "relative mb-5 overflow-hidden rounded-[0.9rem] border border-border/50 bg-card/60",
                mediaAspect
              )}
            >
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="product-card__image object-cover"
              />

              {/* Category badge on hover */}
              <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-background/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/70 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                {product.category}
              </span>
            </div>

            {/* Meta */}
            <div className="space-y-2 px-1 pb-2">
              <div className="flex items-start justify-between gap-3">
                <h3
                  className="font-heading leading-tight tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary"
                  style={{ fontSize: "var(--type-2xl)" }}
                >
                  {product.title}
                </h3>
                <p className="shrink-0 font-bold uppercase tracking-[0.14em] text-primary pt-1"
                   style={{ fontSize: "var(--type-xs)" }}>
                  {product.isCustomOrder ? "Custom" : formatINR(product.price)}
                </p>
              </div>

              <p
                className="line-clamp-2 text-foreground/60 leading-relaxed"
                style={{ fontSize: "var(--type-sm)" }}
              >
                {product.story}
              </p>

              <p
                className="text-foreground/38 uppercase tracking-[0.18em]"
                style={{ fontSize: "var(--type-xs)" }}
              >
                {product.material}
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

  const id       = readFirstString(value, ["id"]);
  const title    = readFirstString(value, ["title"]);
  const imageUrl = readFirstString(value, ["image_url"]);
  const category = resolveProductCategory(value);
  const material = deriveMaterial(value);
  const story    =
    readFirstString(value, ["story", "description", "inspiration"]) ||
    "Crafted to anchor your space in meaning and beauty.";

  const isCustomOrder = Boolean(value.is_custom_order);
  const basePrice     = toNumber(value.price);

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
