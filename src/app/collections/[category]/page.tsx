import { FilterSidebar } from "@/components/FilterSidebar";
import { ActiveFilterPills } from "@/components/ActiveFilterPills";
import { SortDropdown } from "@/components/SortDropdown";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveViewerRole } from "@/lib/security/viewerRole";
import { 
  toSlug, 
  uniqueSlugs, 
  parseMultiSelectParam, 
  PRICE_RANGE_FILTERS, 
  resolveProductCategory, 
  deriveMaterial, 
  toNumber,
  humanizeSlug,
  isRecord
} from "@/lib/catalogFilters";
import { resolveDisplayPrice } from "@/lib/commerce";
import { Suspense } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";

type FacetOption = {
  slug: string;
  label: string;
  count: number;
};

interface CategoryCollectionsPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  const sort = (resolvedSearchParams.sort as string) || "featured";

  const effectiveSelectedCategories =
    selectedCategories.length > 0
      ? selectedCategories
      : categorySlug === "all"
        ? []
        : [categorySlug];

  const supabase = createAdminClient();
  const [{ data: facetRows }, viewerRole] = await Promise.all([
    supabase
      .from("products")
      .select("id, category, material, story, price"),
    resolveViewerRole(supabase),
  ]);

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

    const price = resolveDisplayPrice(toNumber(item.price), viewerRole.isWholesale);
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
    sort,
  ].join("|");

  const heading = categorySlug === "all" ? "All Collections" : humanizeSlug(categorySlug);

  return (
    <div className="min-h-screen px-6 pb-24 pt-32 md:px-12" suppressHydrationWarning>
      <div className="container mx-auto max-w-7xl">
        <header className="glass-shell mb-10 rounded-[1.7rem] px-7 py-8 md:px-10 md:py-11">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Curated Catalog</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="mt-4 max-w-4xl font-heading text-5xl tracking-tight md:text-7xl">
                {heading}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/74 md:text-lg">
                Discover pieces that anchor your space in meaning.
              </p>
            </div>
            <SortDropdown />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[18.5rem_1fr] lg:items-start">
          <FilterSidebar 
            categoryOptions={categoryOptions}
            materialOptions={materialOptions}
            priceCounts={priceCounts}
            selectedCategories={effectiveSelectedCategories}
            selectedPrices={selectedPrices}
            selectedMaterials={selectedMaterials}
          />

          <section>
            <ActiveFilterPills />
            <Suspense key={suspenseKey} fallback={<ProductGridFallback />}>
              <ProductGrid
                categorySlug={categorySlug}
                selectedCategories={effectiveSelectedCategories}
                selectedPriceRanges={selectedPrices}
                selectedMaterials={selectedMaterials}
                sort={sort}
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
