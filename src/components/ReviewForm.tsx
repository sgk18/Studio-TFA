"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/StarRating";
import { submitReview } from "@/app/product/actions";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({ productId, rating, comment });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted — thank you!");
        setRating(0);
        setComment("");
        onReviewSubmitted?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border p-6 space-y-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Your Rating</p>
      <StarRating rating={rating} onRate={setRating} size={24} />

      <div>
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground/50 mb-2">
          Your Review (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience with this product..."
          className="w-full border border-border bg-transparent px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-colors resize-none text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground text-background px-8 py-3 text-xs tracking-widest uppercase font-bold hover:bg-primary transition-colors duration-300 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
