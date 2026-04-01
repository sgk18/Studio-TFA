"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRate?: (r: number) => void;
  size?: number;
}

export function StarRating({ rating, onRate, size = 18 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          className={onRate ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          aria-label={onRate ? `Rate ${star} star${star > 1 ? "s" : ""}` : `${star} star`}
        >
          <Star
            size={size}
            fill={star <= rating ? "#D17484" : "none"}
            stroke={star <= rating ? "#D17484" : "#9CA3AF"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
