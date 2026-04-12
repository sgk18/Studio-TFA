import Image from "next/image";
import Link from "next/link";

import { ScrollReveal } from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import {
  REVIEW_PHOTO_BUCKET_CANDIDATES,
} from "@/lib/reviewPhotos";

export const metadata = {
  title: "Community Gallery | Studio TFA",
  description:
    "A live editorial wall of 5-star customer photo reviews, sourced from Supabase Storage.",
};

type CommunityPhoto = {
  id: string;
  url: string;
  caption: string;
  bucket: string;
  uploadedAt: string | null;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export default async function CommunityPage() {
  const supabase = await createClient();

  const [{ count: fiveStarReviewCount }, photos] = await Promise.all([
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("rating", 5),
    fetchFiveStarStoragePhotos(supabase),
  ]);

  return (
    <div className="min-h-screen px-6 pb-24 pt-32 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <ScrollReveal>
          <header className="glass-shell mb-10 rounded-[1.8rem] px-7 py-9 md:px-10 md:py-12">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
              Community Journal
            </p>
            <h1 className="mt-5 max-w-4xl font-heading text-5xl leading-[0.97] tracking-tight md:text-7xl">
              Real spaces. Real stories. Shared through five-star photo reviews.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/74 md:text-lg">
              This gallery is sourced directly from Supabase Storage and celebrates homes where Studio TFA pieces are already speaking life.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border/70 bg-card/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/70">
                {fiveStarReviewCount ?? 0} five-star reviews
              </span>
              <Link href="/collections" className="action-pill-link px-4 py-2 text-xs">
                Shop the Collection
              </Link>
            </div>
          </header>
        </ScrollReveal>

        {photos.length === 0 ? (
          <div className="glass-shell rounded-[1.6rem] p-10 text-center">
            <p className="text-base text-foreground/72">
              Community uploads have not landed in storage yet. Upload a 5-star photo review from any product page to start the wall.
            </p>
            <Link href="/collections" className="action-pill-link mt-5 px-4 py-2 text-xs">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 xl:columns-3">
            {photos.map((photo, index) => (
              <figure
                key={photo.id}
                className="glass-shell mb-6 break-inside-avoid rounded-[1.3rem] p-3"
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-border/70 bg-card/55",
                    index % 5 === 0
                      ? "aspect-[4/5]"
                      : index % 3 === 0
                        ? "aspect-square"
                        : "aspect-[3/4]"
                  )}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="px-1 pb-1 pt-3">
                  <p className="text-sm leading-relaxed text-foreground/80">{photo.caption}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-foreground/48">
                    <span>{photo.bucket}</span>
                    <span>
                      {photo.uploadedAt
                        ? new Date(photo.uploadedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent upload"}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function fetchFiveStarStoragePhotos(
  supabase: SupabaseServerClient
): Promise<CommunityPhoto[]> {
  const folders = ["rating-5", "five-star"];
  const photos: CommunityPhoto[] = [];

  for (const bucket of REVIEW_PHOTO_BUCKET_CANDIDATES) {
    for (const folder of folders) {
      const { data } = await supabase.storage.from(bucket).list(folder, {
        limit: 120,
        sortBy: { column: "name", order: "desc" },
      });

      for (const item of Array.isArray(data) ? data : []) {
        if (!isLikelyImage(item.name)) continue;

        const objectPath = `${folder}/${item.name}`;
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(objectPath);

        photos.push({
          id: `${bucket}-${objectPath}`,
          url: publicUrlData.publicUrl,
          bucket,
          uploadedAt: typeof item.updated_at === "string" ? item.updated_at : null,
          caption: readableCaption(item.name),
        });
      }
    }
  }

  const deduped = Array.from(new Map(photos.map((photo) => [photo.url, photo])).values());

  deduped.sort((a, b) => {
    const aDate = a.uploadedAt ? Date.parse(a.uploadedAt) : 0;
    const bDate = b.uploadedAt ? Date.parse(b.uploadedAt) : 0;
    return bDate - aDate;
  });

  return deduped.slice(0, 90);
}

function isLikelyImage(name: string): boolean {
  const normalized = name.toLowerCase();
  return /\.(png|jpe?g|webp|gif|avif)$/i.test(normalized);
}

function readableCaption(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  const withSpaces = withoutExtension.replace(/[_-]+/g, " ").trim();

  if (!withSpaces) {
    return "Community photo review";
  }

  return withSpaces[0].toUpperCase() + withSpaces.slice(1);
}
