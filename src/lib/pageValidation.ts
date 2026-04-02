export type ProductCardRecord = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  price: number | string;
};

const ID_PARAM_PATTERN = /^[a-zA-Z0-9_-]{6,80}$/;

export function isValidPageIdParam(value: string): boolean {
  return ID_PARAM_PATTERN.test(value);
}

export function safeDecodeQueryParam(value?: string): string | null {
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function pickAllowedStatus<T extends readonly string[]>(
  value: string | undefined,
  allowed: T
): T[number] | null {
  if (!value) return null;
  return (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : null;
}

export function sanitizeProductCards(raw: unknown): ProductCardRecord[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      const source = item as Record<string, unknown>;
      const id = typeof source.id === "string" ? source.id.trim() : "";
      const title = typeof source.title === "string" ? source.title.trim() : "";
      const imageUrl =
        typeof source.image_url === "string" ? source.image_url.trim() : "";
      const category =
        typeof source.category === "string" && source.category.trim().length > 0
          ? source.category.trim()
          : "Uncategorized";
      const price =
        typeof source.price === "number" || typeof source.price === "string"
          ? source.price
          : "-";

      return {
        id,
        title,
        category,
        image_url: imageUrl,
        price,
      };
    })
    .filter(
      (item) =>
        item.id.length > 0 &&
        item.title.length > 0 &&
        item.image_url.length > 0
    );
}

export function resolvePrimaryNavHref(
  pathname: string | null | undefined
): string | undefined {
  if (!pathname) return undefined;

  if (pathname === "/" || pathname.startsWith("/collections")) return "/collections";
  if (pathname.startsWith("/about")) return "/about";
  if (pathname.startsWith("/c/books")) return "/c/books";
  if (pathname.startsWith("/c/journals")) return "/c/journals";
  if (pathname.startsWith("/c/")) return "/collections";

  return undefined;
}
