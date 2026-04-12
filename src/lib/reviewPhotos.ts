import { isRecord } from "@/lib/catalogFilters";

export const REVIEW_PHOTO_BUCKET_CANDIDATES = [
  "review-photos",
  "community-gallery",
  "reviews",
  "product-reviews",
  "uploads",
] as const;

export const REVIEW_PHOTO_COLUMN_CANDIDATES = [
  "photo_path",
  "photo_url",
  "image_url",
  "media_url",
  "storage_path",
] as const;

export function sanitizeStorageSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isAbsoluteHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function extractReviewPhotoReferences(
  reviewRecord: Record<string, unknown>
): string[] {
  const references = new Set<string>();

  for (const column of REVIEW_PHOTO_COLUMN_CANDIDATES) {
    pushReference(references, reviewRecord[column]);
  }

  const extraCollections = ["photos", "images", "attachments"] as const;
  for (const key of extraCollections) {
    const value = reviewRecord[key];
    if (!Array.isArray(value)) continue;

    for (const item of value) {
      if (typeof item === "string") {
        pushReference(references, item);
        continue;
      }

      if (isRecord(item)) {
        pushReference(references, item.url);
        pushReference(references, item.path);
        pushReference(references, item.src);
      }
    }
  }

  return Array.from(references);
}

function pushReference(target: Set<string>, value: unknown): void {
  if (typeof value !== "string") return;

  const normalized = value.trim();
  if (!normalized) return;

  target.add(normalized);
}
