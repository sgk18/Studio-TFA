export type PriceRangeFilter = {
  id: string;
  label: string;
  min: number;
  max: number | null;
};

export const PRICE_RANGE_FILTERS: PriceRangeFilter[] = [
  { id: "under-1000", label: "Under INR 1,000", min: 0, max: 999 },
  { id: "1000-2499", label: "INR 1,000 - 2,499", min: 1000, max: 2499 },
  { id: "2500-4999", label: "INR 2,500 - 4,999", min: 2500, max: 4999 },
  { id: "5000-plus", label: "INR 5,000+", min: 5000, max: null },
];

const FALLBACK_MATERIAL = "Mixed Media";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readFirstString(
  record: Record<string, unknown>,
  keys: readonly string[]
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humanizeSlug(slug: string): string {
  if (!slug) return "Collection";

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseMultiSelectParam(
  value: string | string[] | undefined
): string[] {
  if (typeof value === "undefined") {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function uniqueSlugs(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => toSlug(value)).filter((value) => value.length > 0))
  );
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function matchesPriceRanges(
  price: number,
  selectedRangeIds: string[]
): boolean {
  if (selectedRangeIds.length === 0) return true;

  return selectedRangeIds.some((rangeId) => {
    const range = PRICE_RANGE_FILTERS.find((item) => item.id === rangeId);
    if (!range) return false;
    if (range.max === null) return price >= range.min;
    return price >= range.min && price <= range.max;
  });
}

export function resolveProductCategory(record: Record<string, unknown>): string {
  return (
    readFirstString(record, ["category", "collection", "type"]) ||
    "Uncategorized"
  );
}

export function deriveMaterial(record: Record<string, unknown>): string {
  const directMaterial = readFirstString(record, [
    "material",
    "materials",
    "fabric",
    "medium",
  ]);

  if (directMaterial) {
    return directMaterial;
  }

  const textBlock =
    readFirstString(record, ["story", "description", "inspiration"])?.toLowerCase() ||
    "";

  if (textBlock.includes("linen")) return "Linen";
  if (textBlock.includes("wood")) return "Wood";
  if (textBlock.includes("canvas")) return "Canvas";
  if (textBlock.includes("paper")) return "Paper";
  if (textBlock.includes("ceramic")) return "Ceramic";

  return FALLBACK_MATERIAL;
}

export function extractProductGallery(record: Record<string, unknown>): string[] {
  const images = new Set<string>();

  const directImageKeys = [
    "image_url",
    "image_url_2",
    "image_url_3",
    "image_url_4",
    "hero_image_url",
    "detail_image_url",
  ] as const;

  for (const key of directImageKeys) {
    pushIfValidUrl(images, record[key]);
  }

  const arrayKeys = ["gallery", "gallery_images", "images"] as const;
  for (const key of arrayKeys) {
    const value = record[key];

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          pushIfValidUrl(images, item);
          continue;
        }

        if (isRecord(item)) {
          pushIfValidUrl(images, item.url);
          pushIfValidUrl(images, item.src);
          pushIfValidUrl(images, item.image_url);
        }
      }
    }
  }

  return Array.from(images);
}

function pushIfValidUrl(target: Set<string>, value: unknown): void {
  if (typeof value !== "string") return;
  const normalized = value.trim();
  if (!normalized) return;
  target.add(normalized);
}
