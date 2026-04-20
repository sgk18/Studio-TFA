"use client";

import Image from "next/image";
import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GripVertical, 
  LoaderCircle, 
  Mail, 
  Sparkles, 
  Maximize2, 
  ExternalLink,
  DollarSign,
  Maximize
} from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

import {
  updateCustomOrderStatusAction,
  type CustomOrderStatus,
} from "@/actions/customOrders";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  dimensions?: string | null;
  estimatedPrice?: number | null;
  trackingNumber?: string | null;
};

export function CustomOrdersKanban({
  initialOrders,
}: {
  initialOrders: AdminCustomOrderCard[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<AdminCustomOrderCard | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sync state with props if they change
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetStatus = destination.droppableId as CustomOrderStatus;
    const orderId = draggableId;

    const movedOrder = orders.find((o) => o.id === orderId);
    if (!movedOrder) return;

    // Optimistic UI update
    const previousOrders = [...orders];
    const newOrders = orders.map(o => o.id === orderId ? { ...o, status: targetStatus } : o);
    setOrders(newOrders);

    startTransition(async () => {
      let trackingNumber = undefined;
      if (targetStatus === "shipped") {
        trackingNumber = prompt("Enter Tracking Number (optional):") || undefined;
      }

      const result = await updateCustomOrderStatusAction({
        orderId,
        status: targetStatus,
        trackingNumber,
      });

      if (result.status === "error") {
        setOrders(previousOrders);
        toast.error(result.message);
      } else {
        toast.success(`${movedOrder.fullName} moved to ${readableStatus(targetStatus)}.`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((column) => (
            <Droppable key={column.status} droppableId={column.status}>
              {(provided, snapshot) => (
                <section
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "flex flex-col min-h-[500px] rounded-[1.5rem] border border-border/65 bg-card/45 p-4 transition-colors",
                    snapshot.isDraggingOver && "border-primary/50 bg-primary/[0.03]"
                  )}
                >
                  <header className="mb-5 flex items-center justify-between px-1">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">
                        {column.subtitle}
                      </p>
                      <h3 className="mt-1 font-heading text-2xl tracking-tight">{column.label}</h3>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold", column.accent)}>
                      {orders.filter(o => o.status === column.status).length}
                    </span>
                  </header>

                  <div className="flex-1 space-y-4">
                    {orders
                      .filter((o) => o.status === column.status)
                      .map((order, index) => (
                        <Draggable key={order.id} draggableId={order.id} index={index}>
                          {(provided, snapshot) => (
                            <article
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedOrder(order)}
                              className={cn(
                                "group relative overflow-hidden rounded-2xl border border-border/70 bg-background p-4 transition-all hover:border-primary/40 hover:shadow-xl",
                                snapshot.isDragging && "scale-[1.02] border-primary shadow-2xl z-50"
                              )}
                            >
                              <div className="mb-3 flex items-start justify-between">
                                <div className="space-y-0.5">
                                  <p className="text-[13px] font-bold tracking-tight">{order.fullName}</p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-foreground/50">
                                    <Mail className="h-2.5 w-2.5" />
                                    {order.email}
                                  </div>
                                </div>
                                <GripVertical className="h-4 w-4 text-foreground/20 group-hover:text-foreground/40 transition-colors" />
                              </div>

                              <p className="line-clamp-2 text-[11px] leading-relaxed text-foreground/70 mb-3 italic">
                                "{order.vision}"
                              </p>

                              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                                {order.dimensions && (
                                  <span className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-foreground/60">
                                    <Maximize className="h-3 w-3" />
                                    {order.dimensions}
                                  </span>
                                )}
                                {order.estimatedPrice ? (
                                  <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                    {formatINR(order.estimatedPrice)}
                                  </span>
                                ) : null}
                              </div>

                              {order.referenceImageUrl && (
                                <div className="mt-3 overflow-hidden rounded-xl border border-border/40 grayscale group-hover:grayscale-0 transition-all">
                                  <Image
                                    src={order.referenceImageUrl}
                                    alt="Reference"
                                    width={400}
                                    height={200}
                                    className="h-20 w-full object-cover"
                                  />
                                </div>
                              )}
                            </article>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </section>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl glass-shell border-primary/20">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest", 
                    KANBAN_COLUMNS.find(c => c.status === selectedOrder.status)?.accent
                  )}>
                    {readableStatus(selectedOrder.status)}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Intake: {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <DialogTitle className="font-heading text-4xl tracking-tight">{selectedOrder.fullName}</DialogTitle>
                <p className="text-sm text-primary flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {selectedOrder.email}
                </p>
              </DialogHeader>

              <div className="grid gap-8 md:grid-cols-2 mt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50 mb-3">Artist Vision</h4>
                    <p className="text-sm leading-relaxed text-foreground/80 bg-muted/30 p-4 rounded-2xl border border-border/40 italic">
                      “{selectedOrder.vision}”
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-1">Dimensions</p>
                      <p className="text-sm font-medium">{selectedOrder.dimensions || "Not specified"}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Estimated Value</p>
                      <p className="text-sm font-bold">{selectedOrder.estimatedPrice ? formatINR(selectedOrder.estimatedPrice) : "Pending Appraisal"}</p>
                    </div>
                  </div>

                  {selectedOrder.trackingNumber && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Tracking Number</p>
                      <p className="text-sm font-mono font-bold text-emerald-800">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50 mb-3">Colour Palette</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.colorPalette.map(color => (
                        <span key={color} className="rounded-full border border-border/70 bg-card/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                          {color}
                        </span>
                      ))}
                    </div>
                    {selectedOrder.paletteNotes && (
                      <p className="mt-3 text-xs text-foreground/60">{selectedOrder.paletteNotes}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Reference Visuals</h4>
                  {selectedOrder.referenceImageUrl ? (
                    <div className="relative group overflow-hidden rounded-[2rem] border border-border/70 bg-card/40 aspect-[4/5]">
                      <Image 
                        src={selectedOrder.referenceImageUrl} 
                        alt="Commission Reference" 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <a 
                        href={selectedOrder.referenceImageUrl} 
                        target="_blank" 
                        className="absolute bottom-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                      >
                        <ExternalLink className="h-4 w-4 text-black" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center aspect-[4/5] rounded-[2rem] border border-dashed border-border/70 bg-muted/20">
                      <Maximize2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">No reference provided</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {isPending && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] inline-flex items-center gap-3 rounded-full border border-primary/20 bg-background/80 backdrop-blur-md px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary shadow-2xl">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Synchronising Studio Board
        </div>
      )}
    </div>
  );
}

function readableStatus(status: CustomOrderStatus): string {
  switch(status) {
    case "todo": return "To-Do";
    case "in_progress": return "In Progress";
    case "review": return "Review";
    case "shipped": return "Shipped";
    default: return status;
  }
}
