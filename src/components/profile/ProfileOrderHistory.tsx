import Link from "next/link";
import { FileText } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type OrderHistoryRow = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "id" | "created_at" | "total_amount" | "status" | "currency"
>;

export async function ProfileOrderHistory({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: ordersRaw, error } = await supabase
    .from("orders")
    .select("id, created_at, total_amount, status, currency")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Unable to load order history right now. Please refresh and try again.
      </div>
    );
  }

  const orders = (ordersRaw ?? []) as OrderHistoryRow[];

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/55 px-5 py-6">
        <p className="font-sans text-sm text-foreground/72">
          You do not have any orders yet.
        </p>
        <Link href="/collections" className="mt-4 inline-flex action-pill-link text-xs">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {orders.map((order) => {
        const status = describeOrderStatus(order.status);

        return (
          <article
            key={order.id}
            className="rounded-2xl border border-border/70 bg-card/55 p-5 shadow-[0_8px_26px_rgba(139,38,62,0.06)]"
          >
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_0.8fr_0.8fr_auto] md:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Order ID</p>
                <p className="mt-1 font-mono text-xs text-foreground/70">{order.id}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Date</p>
                <p className="mt-1 text-sm text-foreground/80">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Total Amount</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatINR(order.total_amount)}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div>
                <Link
                  href={`/profile/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Invoice
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ProfileOrderHistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border/60 bg-card/45 p-5">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_0.8fr_0.8fr_auto] md:items-center">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3.5 w-full max-w-52" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function describeOrderStatus(rawStatus: string) {
  const status = rawStatus.trim().toLowerCase();

  switch (status) {
    case "pending":
    case "paid":
      return {
        label: "Processing",
        className: "border-amber-600/35 bg-amber-500/10 text-amber-700",
      };
    case "fulfilled":
      return {
        label: "Shipped",
        className: "border-emerald-600/35 bg-emerald-500/10 text-emerald-700",
      };
    case "refunded":
      return {
        label: "Refunded",
        className: "border-blue-600/35 bg-blue-500/10 text-blue-700",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700",
      };
    case "failed":
      return {
        label: "Payment Failed",
        className: "border-destructive/35 bg-destructive/10 text-destructive",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        className: "border-border/70 bg-card/70 text-foreground/75",
      };
  }
}
