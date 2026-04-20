import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton with Studio TFA warm-cream shimmer animation.
 * Matches the exact background tone of product cards so there is
 * zero layout shift between skeleton and loaded content.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-xl tfa-skeleton", className)}
      {...props}
    />
  );
}

export { Skeleton };
