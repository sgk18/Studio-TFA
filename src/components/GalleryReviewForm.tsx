"use client";

import React, { useState, useTransition } from "react";
import { StarRating } from "@/components/StarRating";
import { submitGalleryReview } from "@/app/product/actions";
import { toast } from "sonner";
import { ImagePlus, LoaderCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryReviewFormProps {
  productId: string;
}

export function GalleryReviewForm({ productId }: GalleryReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please add a title for your review.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("rating", String(rating));
      formData.set("title", title.trim());
      formData.set("comment", comment.trim());
      if (photo) formData.set("photo", photo);

      const result = await submitGalleryReview(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Review submitted ✦ It will be visible once verified.");
      // Reset form
      setRating(5);
      setTitle("");
      setComment("");
      setPhoto(null);
    });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="glass-shell rounded-[2rem] p-6 md:p-8 space-y-6 border-none bg-card/45"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Your Experience</p>
        <h3 className="mt-2 font-heading text-3xl tracking-tight">Write a Review</h3>
        <p className="mt-2 text-[13px] text-foreground/60 leading-relaxed italic">
          Share how this piece lives in your home and your faith journey.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {/* Star Rating */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/50">
            Curation Rating
          </label>
          <StarRating rating={rating} onRate={setRating} size={24} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/50">
            Review Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. A daily reminder of peace"
            className="w-full bg-background/50 border border-border/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Reflection */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/50">
            Your Reflection
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Describe the material quality, the story it tells, or the atmosphere it creates..."
            className="w-full bg-background/50 border border-border/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Photo Upload (Optional) */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/50">
            Visual Proof (Optional)
          </label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={cn(
              "flex items-center justify-center gap-3 border border-dashed border-border/70 rounded-xl p-6 transition-colors group-hover:bg-primary/5",
              photo ? "bg-primary/[0.03] border-primary/30" : "bg-background/20"
            )}>
              {photo ? (
                <div className="flex flex-col items-center">
                  <p className="text-xs font-medium text-primary">Attached: {photo.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Click to change photo</p>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-5 w-5 text-muted-foreground/60" />
                  <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    Add a photo of the piece
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-4 px-8 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Publish to Gallery
            </>
          )}
        </button>
      </div>
    </form>
  );
}
