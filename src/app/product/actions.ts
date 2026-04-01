"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview({
  productId,
  rating,
  comment,
}: {
  productId: string;
  rating: number;
  comment: string;
}) {
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
  return { success: true };
}
