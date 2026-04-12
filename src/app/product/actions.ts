"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidPageIdParam } from "@/lib/pageValidation";
import {
  REVIEW_PHOTO_BUCKET_CANDIDATES,
  REVIEW_PHOTO_COLUMN_CANDIDATES,
  sanitizeStorageSegment,
} from "@/lib/reviewPhotos";

const MAX_REVIEW_PHOTO_BYTES = 8 * 1024 * 1024;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function submitReview({
  productId,
  rating,
  comment,
}: {
  productId: string;
  rating: number;
  comment: string;
}) {
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

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment: comment.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/product/${productId}`);
  if (rating === 5) {
    revalidatePath("/community");
  }

  return { success: true };
}

export async function submitPhotoReview(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();
  const photo = formData.get("photo");

  if (!isValidPageIdParam(productId)) {
    return { error: "Invalid product identifier." };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5 stars." };
  }

  if (!(photo instanceof File)) {
    return { error: "Please attach a photo before submitting." };
  }

  if (!photo.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }

  if (photo.size <= 0 || photo.size > MAX_REVIEW_PHOTO_BYTES) {
    return { error: "Photo must be between 1 byte and 8MB." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to upload a photo review." };
  }

  const { data: insertedReview, error: insertError } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment || null,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  const reviewId =
    insertedReview && typeof insertedReview.id === "string" ? insertedReview.id : null;

  const uploadResult = await uploadReviewPhoto({
    supabase,
    file: photo,
    productId,
    userId: user.id,
    rating,
  });

  if ("error" in uploadResult) {
    if (reviewId) {
      await supabase.from("reviews").delete().eq("id", reviewId);
    }
    return { error: uploadResult.error };
  }

  if (reviewId) {
    await attachPhotoReferenceToReview(
      supabase,
      reviewId,
      uploadResult.path,
      uploadResult.publicUrl
    );
  }

  revalidatePath(`/product/${productId}`);
  if (rating === 5) {
    revalidatePath("/community");
  }

  return { success: true };
}

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
  const fileExtension = extensionForFile(file);
  const ratingFolder = `rating-${rating}`;
  const objectPath = `${ratingFolder}/${sanitizeStorageSegment(productId)}/${sanitizeStorageSegment(userId)}/${Date.now()}-${safeBaseName}.${fileExtension}`;

  let lastErrorMessage = "Unable to upload your review photo right now.";

  for (const bucket of REVIEW_PHOTO_BUCKET_CANDIDATES) {
    const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
      return {
        bucket,
        path: objectPath,
        publicUrl: data.publicUrl,
      };
    }

    lastErrorMessage = error.message;
  }

  return { error: lastErrorMessage };
}

async function attachPhotoReferenceToReview(
  supabase: SupabaseServerClient,
  reviewId: string,
  storagePath: string,
  publicUrl: string
) {
  for (const column of REVIEW_PHOTO_COLUMN_CANDIDATES) {
    const pathPayload: Record<string, string> = { [column]: storagePath };
    const { error } = await supabase
      .from("reviews")
      .update(pathPayload)
      .eq("id", reviewId);

    if (!error) {
      return;
    }

    const isMissingColumn =
      error.code === "42703" || error.message.toLowerCase().includes("column");

    if (!isMissingColumn) {
      break;
    }
  }

  for (const column of REVIEW_PHOTO_COLUMN_CANDIDATES) {
    const urlPayload: Record<string, string> = { [column]: publicUrl };
    const { error } = await supabase
      .from("reviews")
      .update(urlPayload)
      .eq("id", reviewId);

    if (!error) {
      return;
    }

    const isMissingColumn =
      error.code === "42703" || error.message.toLowerCase().includes("column");

    if (!isMissingColumn) {
      break;
    }
  }
}

function extensionForFile(file: File): string {
  const directExtension = file.name.split(".").pop()?.trim().toLowerCase();

  if (directExtension && directExtension.length <= 6) {
    return directExtension;
  }

  const mimeSubtype = file.type.split("/").pop()?.toLowerCase();
  if (mimeSubtype && mimeSubtype.length <= 10) {
    return mimeSubtype === "jpeg" ? "jpg" : mimeSubtype;
  }

  return "jpg";
}
