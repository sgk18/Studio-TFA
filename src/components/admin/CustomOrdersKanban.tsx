"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, LoaderCircle, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  updateCustomOrderStatusAction,
  type CustomOrderStatus,
} from "@/actions/customOrders";
import { cn } from "@/lib/utils";

const KANBAN_COLUMNS: Array<{
  status: CustomOrderStatus;
  label: string;
  subtitle: string;
  accent: string;
}> = [
  {
    status: "todo",
    label: "To-Do",
    subtitle: "New briefs queued",
    accent: "bg-[#f5dce3] text-[#6d2b3c]",
  },
  {
    status: "in_progress",
    label: "In Progress",
    subtitle: "Active studio work",
    accent: "bg-[#ece4cf] text-[#5a4f1b]",
  },
  {
    status: "review",
    label: "Review",
    subtitle: "Waiting on approval",
    accent: "bg-[#dde9e2] text-[#2d5a47]",
  },
  {
    status: "shipped",
    label: "Shipped",
    subtitle: "Delivered to customer",
    accent: "bg-[#dfebf5] text-[#284a68]",
  },
];

export type AdminCustomOrderCard = {
  id: string;
  fullName: string;
  email: string;
  vision: string;
  colorPalette: string[];
  paletteNotes: string | null;
  referenceImageUrl: string | null;
  status: CustomOrderStatus;
  createdAt: string;
};

export function CustomOrdersKanban({
  initialOrders,
}: {
  initialOrders: AdminCustomOrderCard[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<CustomOrderStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  const groupedOrders = useMemo(() => {
    return KANBAN_COLUMNS.map((column) => {
      const columnItems = orders
        .filter((order) => order.status === column.status)
        .sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return bTime - aTime;
        });

      return {
        ...column,
        items: columnItems,
      };
    });
  }, [orders]);

  const handleDrop = (targetStatus: CustomOrderStatus, orderId: string) => {
    const movedOrder = orders.find((order) => order.id === orderId);
    if (!movedOrder || movedOrder.status === targetStatus) {
      return;
    }

    const previousOrders = orders;

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: targetStatus,
            }
          : order
      )
    );

    startTransition(async () => {
      const result = await updateCustomOrderStatusAction({
        orderId,
        status: targetStatus,
      });

      if (result.status === "error") {
        setOrders(previousOrders);
        toast.error(result.message);
        return;
      }

      toast.success(`${movedOrder.fullName} moved to ${readableStatus(targetStatus)}.`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.16em] text-foreground/65">
        Drag cards between columns to update order status.
      </p>

      <div className="grid gap-4 xl:grid-cols-4">
        {groupedOrders.map((column) => (
          <section
            key={column.status}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverStatus(column.status);
            }}
            onDragLeave={() => setDragOverStatus((current) => (current === column.status ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              const droppedOrderId = event.dataTransfer.getData("text/custom-order-id");
              setDragOverStatus(null);

              if (droppedOrderId) {
                handleDrop(column.status, droppedOrderId);
              }
            }}
            className={cn(
              "rounded-[1.35rem] border border-border/65 bg-card/45 p-3.5 transition-colors",
              dragOverStatus === column.status && "border-primary/70 bg-primary/10"
            )}
          >
            <header className="mb-3 flex items-center justify-between gap-2 px-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/62">
                  {column.subtitle}
                </p>
                <h3 className="mt-1 font-heading text-2xl tracking-tight">{column.label}</h3>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", column.accent)}>
                {column.items.length}
              </span>
            </header>

            <div className="space-y-3">
              {column.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 px-3 py-5 text-center text-xs uppercase tracking-[0.14em] text-foreground/55">
                  No orders here yet
                </div>
              ) : (
                column.items.map((order) => (
                  <article
                    key={order.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/custom-order-id", order.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggingOrderId(order.id);
                    }}
                    onDragEnd={() => {
                      setDraggingOrderId(null);
                      setDragOverStatus(null);
                    }}
                    className={cn(
                      "rounded-2xl border border-border/70 bg-background/85 p-4 shadow-[0_14px_28px_rgba(41,40,0,0.08)]",
                      draggingOrderId === order.id && "opacity-55"
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{order.fullName}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-foreground/62">
                          <Mail className="h-3.5 w-3.5" />
                          {order.email}
                        </p>
                      </div>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card/55 text-foreground/60">
                        <GripVertical className="h-4 w-4" />
                      </span>
                    </div>

                    <p className="text-xs leading-6 text-foreground/74">{order.vision}</p>

                    {order.colorPalette.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {order.colorPalette.map((color) => (
                          <span
                            key={`${order.id}-${color}`}
                            className="rounded-full border border-border/70 bg-card/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.13em]"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {order.paletteNotes ? (
                      <p className="mt-3 rounded-xl border border-border/70 bg-card/55 px-2.5 py-2 text-xs text-foreground/68">
                        {order.paletteNotes}
                      </p>
                    ) : null}

                    {order.referenceImageUrl ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
                        <Image
                          src={order.referenceImageUrl}
                          alt={`Reference upload from ${order.fullName}`}
                          width={560}
                          height={360}
                          className="h-28 w-full object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between border-t border-border/65 pt-2 text-[11px] uppercase tracking-[0.13em] text-foreground/55">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        {readableStatus(order.status)}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      {isPending ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs uppercase tracking-[0.13em] text-primary">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          Syncing board updates
        </div>
      ) : null}
    </div>
  );
}

function readableStatus(status: CustomOrderStatus): string {
  if (status === "todo") {
    return "To-Do";
  }

  if (status === "in_progress") {
    return "In Progress";
  }

  if (status === "review") {
    return "Review";
  }

  return "Shipped";
}
