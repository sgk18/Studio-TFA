"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, MessageSquare, ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import {
  approveReviewAction,
  rejectReviewAction,
  submitAdminReplyAction,
} from "@/actions/reviews";
import { cn } from "@/lib/utils";

export type AdminReviewRow = {
  id: string;
  productTitle: string;
  productId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
};

export function AdminReviewsTable({ reviews }: { reviews: AdminReviewRow[] }) {
  return (
    <div className="space-y-3">
      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-12 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-foreground/45">
            No reviews found
          </p>
        </div>
      ) : (
        reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: AdminReviewRow }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(review.adminReply ?? "");
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveReviewAction(review.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Review approved ✦");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectReviewAction(review.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Review hidden.");
      }
    });
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    startTransition(async () => {
      const result = await submitAdminReplyAction({
        reviewId: review.id,
        reply: replyText.trim(),
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Reply posted ✦");
        setShowReplyBox(false);
      }
    });
  };

  return (
    <article className="rounded-2xl border border-border/70 bg-card/45 p-5 transition-colors hover:border-border">
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{review.reviewerName}</p>
            <span className="text-xs text-foreground/40">·</span>
            <p className="text-xs text-foreground/55 truncate max-w-[200px]">{review.reviewerEmail}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-primary mb-2">
            {review.productTitle}
          </p>
          <div className="flex items-center gap-3">
            <StarRating rating={review.rating} size={14} />
            {review.title && (
              <span className="text-sm font-medium text-foreground/80">
                {review.title}
              </span>
            )}
          </div>
        </div>

        {/* Status + date */}
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
              review.isApproved
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            )}
          >
            {review.isApproved ? "Approved" : "Pending"}
          </span>
          <span className="text-[11px] text-foreground/40">
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-foreground/72 border-t border-border/60 pt-3">
          {review.comment}
        </p>
      )}

      {/* Existing admin reply */}
      {review.adminReply && (
        <div className="mt-3 rounded-xl border border-primary/15 bg-[rgba(224,174,186,0.1)] px-4 py-3 border-l-2 border-l-primary">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary mb-1.5">
            Response from Sherlin ✦
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{review.adminReply}</p>
          {review.adminReplyAt && (
            <p className="text-[10px] text-foreground/40 mt-1.5">
              Replied{" "}
              {new Date(review.adminReplyAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        {!review.isApproved ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs text-green-700 border-green-700/30 hover:bg-green-50"
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Approve
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs text-amber-700 border-amber-700/30 hover:bg-amber-50"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
            Unpublish
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setShowReplyBox((v) => !v)}
        >
          <MessageSquare className="h-3 w-3" />
          {review.adminReply ? "Edit Reply" : "Reply"}
          {showReplyBox ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Inline reply textarea */}
      {showReplyBox && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply as Sherlin…"
            className="min-h-[100px] resize-none text-sm"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setShowReplyBox(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleSubmitReply}
              disabled={isPending || !replyText.trim()}
            >
              {isPending ? (
                <LoaderCircle className="h-3 w-3 animate-spin" />
              ) : (
                "Post Reply ✦"
              )}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
