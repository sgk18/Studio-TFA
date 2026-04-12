import { Suspense } from "react";
import Link from "next/link";

import { ProductGrid } from "@/components/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/server";
import {
  deriveMaterial,
  humanizeSlug,
  isRecord,
  parseMultiSelectParam,
  PRICE_RANGE_FILTERS,
  resolveProductCategory,
  toNumber,
  toSlug,
  uniqueSlugs,
} from "@/lib/catalogFilters";

interface CategoryCollectionsPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type FacetOption = {
  slug: string;
  label: string;
  count: number;
};

export async function generateMetadata({ params }: Pick<CategoryCollectionsPageProps, "params">) {
  const { category } = await params;
  const categorySlug = toSlug(category);

  return {
    title:
      categorySlug === "all"
        ? "All Collections | Studio TFA"
        : `${humanizeSlug(categorySlug)} Collection | Studio TFA`,
    description:
      categorySlug === "all"
        ? "Browse every category in Studio TFA's editorial storefront."
        : `Explore the ${humanizeSlug(categorySlug)} collection with faceted filtering by material and price.`,
  };
}

export default async function CategoryCollectionsPage({
  params,
  searchParams,
}: CategoryCollectionsPageProps) {
  const [{ category }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const categorySlug = toSlug(category) || "all";

  const selectedCategories = uniqueSlugs(
    parseMultiSelectParam(resolvedSearchParams.category)
  );
  const selectedPrices = uniqueSlugs(parseMultiSelectParam(resolvedSearchParams.price));
  const selectedMaterials = uniqueSlugs(
    parseMultiSelectParam(resolvedSearchParams.material)
  );

  const effectiveSelectedCategories =
    selectedCategories.length > 0
      ? selectedCategories
      : categorySlug === "all"
        ? []
        : [categorySlug];

  const supabase = await createClient();
  const { data: facetRows } = await supabase
    .from("products")
    .select("id, category, material, story, price");

  const categoryMap = new Map<string, FacetOption>();
  const materialMap = new Map<string, FacetOption>();
  const priceCounts = new Map<string, number>(
    PRICE_RANGE_FILTERS.map((range) => [range.id, 0])
  );

  for (const item of Array.isArray(facetRows) ? facetRows : []) {
    if (!isRecord(item)) continue;

    const categoryLabel = resolveProductCategory(item);
    const categoryOptionSlug = toSlug(categoryLabel);
    if (categoryOptionSlug) {
      const current = categoryMap.get(categoryOptionSlug);
      categoryMap.set(categoryOptionSlug, {
        slug: categoryOptionSlug,
        label: categoryLabel,
        count: (current?.count ?? 0) + 1,
      });
    }

    const materialLabel = deriveMaterial(item);
    const materialOptionSlug = toSlug(materialLabel);
    if (materialOptionSlug) {
      const current = materialMap.get(materialOptionSlug);
      materialMap.set(materialOptionSlug, {
        slug: materialOptionSlug,
        label: materialLabel,
        count: (current?.count ?? 0) + 1,
      });
    }

    const price = toNumber(item.price);
    for (const range of PRICE_RANGE_FILTERS) {
      const inRange =
        range.max === null
          ? price >= range.min
          : price >= range.min && price <= range.max;

      if (inRange) {
        priceCounts.set(range.id, (priceCounts.get(range.id) ?? 0) + 1);
      }
    }
  }

  const categoryOptions = Array.from(categoryMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const materialOptions = Array.from(materialMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const suspenseKey = [
    categorySlug,
    effectiveSelectedCategories.join("-"),
    selectedPrices.join("-"),
    selectedMaterials.join("-"),
  ].join("|");

  const heading = categorySlug === "all" ? "All Collections" : humanizeSlug(categorySlug);

  return (
    <div className="min-h-screen px-6 pb-24 pt-32 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <header className="glass-shell mb-10 rounded-[1.7rem] px-7 py-8 md:px-10 md:py-11">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Curated Catalog</p>
          <h1 className="mt-4 max-w-4xl font-heading text-5xl tracking-tight md:text-7xl">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/74 md:text-lg">
            Filter this collection by category, price, and material to discover the pieces that fit your story and your space.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[18.5rem_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <form method="get" className="glass-shell rounded-[1.4rem] p-6 space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
                  Category
                </h2>
                <div className="mt-3 space-y-2">
                  {categoryOptions.map((option) => (
                    <label
                      key={option.slug}
                      className="flex items-center justify-between rounded-xl border border-border/65 bg-card/45 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2.5 text-foreground/85">
                        <input
                          type="checkbox"
                          name="category"
                          value={option.slug}
                          defaultChecked={effectiveSelectedCategories.includes(option.slug)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        {option.label}
                      </span>
                      <span className="text-xs text-foreground/50">{option.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
                  Price
                </h2>
                <div className="mt-3 space-y-2">
                  {PRICE_RANGE_FILTERS.map((range) => (
                    <label
                      key={range.id}
                      className="flex items-center justify-between rounded-xl border border-border/65 bg-card/45 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2.5 text-foreground/85">
                        <input
                          type="checkbox"
                          name="price"
                          value={range.id}
                          defaultChecked={selectedPrices.includes(range.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        {range.label}
                      </span>
                      <span className="text-xs text-foreground/50">{priceCounts.get(range.id) ?? 0}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
                  Material
                </h2>
                <div className="mt-3 space-y-2">
                  {materialOptions.map((option) => (
                    <label
                      key={option.slug}
                      className="flex items-center justify-between rounded-xl border border-border/65 bg-card/45 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2.5 text-foreground/85">
                        <input
                          type="checkbox"
                          name="material"
                          value={option.slug}
                          defaultChecked={selectedMaterials.includes(option.slug)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        {option.label}
                      </span>
                      <span className="text-xs text-foreground/50">{option.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="action-pill-link flex-1 justify-center px-3 text-xs">
                  Apply
                </button>
                <Link
                  href={`/collections/${categorySlug}`}
                  className="action-pill-link flex-1 justify-center px-3 text-xs"
                >
                  Reset
                </Link>
              </div>
            </form>
          </aside>

          <section>
            <Suspense key={suspenseKey} fallback={<ProductGridFallback />}>
              <ProductGrid
                categorySlug={categorySlug}
                selectedCategories={effectiveSelectedCategories}
                selectedPriceRanges={selectedPrices}
                selectedMaterials={selectedMaterials}
              />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-6 lg:gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={`glass-shell rounded-[1.4rem] p-4 ${index % 5 === 0 ? "md:col-span-4" : "md:col-span-3"}`}
        >
          <Skeleton className="mb-5 aspect-[3/4] w-full" />
          <Skeleton className="mb-3 h-4 w-1/3" />
          <Skeleton className="mb-2 h-8 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
