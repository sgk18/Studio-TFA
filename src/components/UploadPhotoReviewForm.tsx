"use client";

import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import { StarRating } from "@/components/StarRating";
import { submitGalleryReview } from "@/app/product/actions";

interface UploadPhotoReviewFormProps {
  productId: string;
}

export function UploadPhotoReviewForm({ productId }: UploadPhotoReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please choose a valid star rating.");
      return;
    }

    if (!photo) {
      toast.error("Please upload a review photo before submitting.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("rating", String(rating));
      formData.set("comment", comment.trim());
      formData.set("photo", photo);

      const result = await submitGalleryReview(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        rating === 5
          ? "Photo review submitted. You may appear in the community gallery soon."
          : "Photo review submitted successfully."
      );

      setRating(5);
      setComment("");
      setPhoto(null);
      setFileInputKey((current) => current + 1);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-shell rounded-[1.3rem] p-6 space-y-5 md:p-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/55">
          Upload Photo Review
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          Share a real-life photo of this piece in your space. Five-star uploads are featured in our community gallery.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-foreground/55">
          Your Rating
        </label>
        <StarRating rating={rating} onRate={setRating} size={22} />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-foreground/55">
          Photo
        </label>
        <input
          key={fileInputKey}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const nextPhoto = event.target.files?.[0] ?? null;
            setPhoto(nextPhoto);
          }}
          className="glass-input block w-full rounded-xl border px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3.5 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-primary-foreground"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-foreground/55">
          Reflection (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          rows={3}
          placeholder="How does this piece speak to your home or your faith journey?"
          className="glass-input w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:border-primary/60"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-primary/75 bg-primary px-7 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit Photo Review"}
      </button>
    </form>
  );
}
