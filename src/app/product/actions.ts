"use server";

import { resolveDisplayPrice } from "@/lib/commerce";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidPageIdParam } from "@/lib/pageValidation";
import {
  REVIEW_PHOTO_BUCKET_CANDIDATES,
  REVIEW_PHOTO_COLUMN_CANDIDATES,
  sanitizeStorageSegment,
} from "@/lib/reviewPhotos";

const MAX_REVIEW_PHOTO_BYTES = 8 * 1024 * 1024;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Consolidated action to submit a review with rating, title, comment and optional photo.
 */
export async function submitGalleryReview(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const photo = formData.get("photo");

  if (!isValidPageIdParam(productId)) {
    return { error: "Invalid product identifier." };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5 stars." };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to leave a review." };
  }

  // 1. Verify Purchase Gate
  const { data: purchaseCount, error: purchaseError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .containedBy("items", JSON.stringify([{ product_id: productId }]))
    .in("payment_status", ["captured", "authorized"]);

  if (purchaseError) {
    return { error: "Verification failed. Please try again." };
  }

  if ((purchaseCount ?? 0) === 0) {
    return { error: "Purchase this product to leave a verified review." };
  }

  // 2. Insert Review (Draft Status)
  const { data: insertedReview, error: insertError } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title: title || null,
      comment: comment || null,
      is_approved: false,
      is_verified: true,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  const reviewId = insertedReview.id;

  // 3. Handle Optional Photo
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return { error: "Only image files are allowed." };
    }
    if (photo.size > MAX_REVIEW_PHOTO_BYTES) {
      return { error: "Photo must be 8MB or less." };
    }

    const uploadResult = await uploadReviewPhoto({
      supabase,
      file: photo,
      productId,
      userId: user.id,
      rating,
    });

    if ("error" in uploadResult) {
      // We don't delete the review if the photo fails, just notify
      return { success: true, message: "Review posted, but photo upload failed." };
    }

    await attachPhotoReferenceToReview(
      supabase,
      reviewId,
      uploadResult.path,
      uploadResult.publicUrl
    );
  }

  revalidatePath(`/product/${productId}`);
  revalidatePath("/admin/reviews");
  if (rating === 5) {
    revalidatePath("/community");
  }

  return { success: true };
}

/**
 * Helper to check if a user has purchased a specific product.
 */
export async function checkProductPurchaseAction(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .containedBy("items", JSON.stringify([{ product_id: productId }]))
    .in("payment_status", ["captured", "authorized"]);

  return (count ?? 0) > 0;
}

// ── INTERNAL HELPERS ─────────────────────────────────────────────────────────

async function uploadReviewPhoto({
  supabase,
  file,
  productId,
  userId,
  rating,
}: {
  supabase: SupabaseServerClient;
  file: File;
  productId: string;
  userId: string;
  rating: number;
}): Promise<
  | { bucket: string; path: string; publicUrl: string }
  | { error: string }
> {
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const safeBaseName = sanitizeStorageSegment(baseName) || "review-photo";
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const objectPath = `rating-${rating}/${sanitizeStorageSegment(productId)}/${sanitizeStorageSegment(userId)}/${Date.now()}-${safeBaseName}.${fileExtension}`;

  for (const bucket of REVIEW_PHOTO_BUCKET_CANDIDATES) {
    const { error } = await supabase.storage.from(bucket).upload(objectPath, file);

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
      return { bucket, path: objectPath, publicUrl: data.publicUrl };
    }
  }

  return { error: "Upload failed" };
}

async function attachPhotoReferenceToReview(
  supabase: SupabaseServerClient,
  reviewId: string,
  storagePath: string,
  publicUrl: string
) {
  for (const column of REVIEW_PHOTO_COLUMN_CANDIDATES) {
    const { error } = await supabase
      .from("reviews")
      .update({ [column]: publicUrl })
      .eq("id", reviewId);

    if (!error) return;
  }
}
