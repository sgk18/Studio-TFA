"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/security/adminRole";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import ReviewReplyEmail from "@/emails/ReviewReplyEmail";

// ─── Admin: Approve a review ──────────────────────────────────────────────────

const reviewIdSchema = z.string().uuid();

export async function approveReviewAction(reviewId: string) {
  const parsed = reviewIdSchema.safeParse(reviewId);
  if (!parsed.success) return { error: "Invalid review ID." };

  const { supabase } = await requireAdminAccess({ from: "/admin/reviews" });

  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/product/[id]", "page");
  return { success: true };
}

// ─── Admin: Reject (un-approve) a review ─────────────────────────────────────

export async function rejectReviewAction(reviewId: string) {
  const parsed = reviewIdSchema.safeParse(reviewId);
  if (!parsed.success) return { error: "Invalid review ID." };

  const { supabase } = await requireAdminAccess({ from: "/admin/reviews" });

  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: false })
    .eq("id", parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/product/[id]", "page");
  return { success: true };
}

// ─── Admin: Post a reply to a review ─────────────────────────────────────────

const replySchema = z.object({
  reviewId: z.string().uuid(),
  reply: z.string().trim().min(2).max(2000),
});

export async function submitAdminReplyAction(payload: {
  reviewId: string;
  reply: string;
}) {
  const parsed = replySchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload." };
  }

  const { supabase } = await requireAdminAccess({ from: "/admin/reviews" });

  // Fetch reviewer email so we can send them a notification
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select(
      "id, comment, rating, admin_reply, profiles(email, full_name), products(title)"
    )
    .eq("id", parsed.data.reviewId)
    .single();

  if (fetchError || !review) {
    return { error: "Review not found." };
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      admin_reply: parsed.data.reply,
      admin_reply_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.reviewId);

  if (updateError) return { error: updateError.message };

  // Send email notification to reviewer via Edge Function (best-effort, asynchronous)
  try {
    const reviewerProfile = Array.isArray(review.profiles)
      ? review.profiles[0]
      : review.profiles;
    
    const reviewerEmail =
      reviewerProfile && typeof reviewerProfile === "object" && "email" in reviewerProfile
        ? String((reviewerProfile as { email: unknown }).email ?? "")
        : "";

    if (reviewerEmail) {
      // Use the service client to trigger the edge function
      // This is more robust as it uses our centralized email logic
      await supabase.functions.invoke("email-service", {
        body: {
          trigger: "review_reply",
          payload: {
            review_id: parsed.data.reviewId
          }
        }
      });
    }
  } catch (err) {
    console.error("Failed to trigger review reply email:", err);
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/product/[id]", "page");
  return { success: true };
}

// ─── Customer: Submit a new review ───────────────────────────────────────────

const submitReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().max(2000).optional(),
});

export async function submitReviewAction(payload: {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
}) {
  const parsed = submitReviewSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to leave a review." };

  // Verified-buyer check: user must have a PAID order containing this product
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "paid")
    .contains("items", JSON.stringify([{ product_id: parsed.data.productId }]));

  const isVerified = (count ?? 0) > 0;

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    comment: parsed.data.comment ?? null,
    is_verified_purchase: isVerified,
    is_verified: isVerified,
    is_approved: false, // always pending moderation
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already reviewed this product." };
    }
    return { error: error.message };
  }

  revalidatePath(`/product/${parsed.data.productId}`);
  return { success: true };
}
