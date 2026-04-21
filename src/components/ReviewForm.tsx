"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/StarRating";
import { submitGalleryReview } from "@/app/product/actions";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a rating.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      if (orderId) formData.append("orderId", orderId);

      const result = await submitGalleryReview(formData);
      if (result.success) {
        toast.success(result.message || "Review submitted! Thank you for your feedback.");
        setRating(0);
        setComment("");
        onSuccess?.();
      } else {
        toast.error(result.error || "Submission failed.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-shell rounded-2xl p-6 space-y-5">
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
          className="glass-input w-full rounded-xl px-4 py-3 focus:outline-none focus:border-primary/60 transition-colors resize-none text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-primary/80 bg-primary text-primary-foreground px-8 py-3 text-xs tracking-widest uppercase font-bold hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
