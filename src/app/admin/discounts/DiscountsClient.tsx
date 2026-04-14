"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  LoaderCircle,
  Gift,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDiscountCodeAction,
  toggleDiscountCodeAction,
  deleteDiscountCodeAction,
  createGiftCardAction,
} from "@/actions/discounts";
import { cn } from "@/lib/utils";

type DiscountCode = {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

type GiftCard = {
  id: string;
  code: string;
  initialValue: number;
  remainingValue: number;
  recipientEmail: string;
  expiresAt: string | null;
  isRedeemed: boolean;
  createdAt: string;
};

export function AdminDiscountsClient({
  codes,
  giftCards,
}: {
  codes: DiscountCode[];
  giftCards: GiftCard[];
}) {
  const [activeTab, setActiveTab] = useState<"codes" | "gifts">("codes");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {(["codes", "gifts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] border transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/70 bg-card/40 text-foreground/65 hover:border-border"
            )}
          >
            {tab === "codes" ? "Promo Codes" : "Gift Cards"}
          </button>
        ))}
      </div>

      {activeTab === "codes" ? (
        <CodesPanel codes={codes} />
      ) : (
        <GiftCardsPanel giftCards={giftCards} />
      )}
    </div>
  );
}

// ── Promo Codes Panel ─────────────────────────────────────────────────────────

function CodesPanel({ codes }: { codes: DiscountCode[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percent" as "percent" | "flat",
    value: "",
    minOrder: "0",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createDiscountCodeAction({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Discount code created ✦");
        setShowForm(false);
        setForm({ code: "", type: "percent", value: "", minOrder: "0", maxUses: "", expiresAt: "", isActive: true });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{codes.length} code{codes.length !== 1 ? "s" : ""} total</p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5" />
          New Code
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl border border-border/70 bg-card/50 p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            New Promo Code
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as "percent" | "flat" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">
                Value ({form.type === "percent" ? "%" : "₹"})
              </Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "percent" ? "20" : "200"}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">Min Order (₹)</Label>
              <Input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                placeholder="500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">Max Uses (blank = unlimited)</Label>
              <Input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">Expires At</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={isPending || !form.code || !form.value}>
              {isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : "Create Code ✦"}
            </Button>
          </div>
        </div>
      )}

      {/* Codes list */}
      {codes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 py-10 text-center">
          <Tag className="mx-auto h-8 w-8 text-foreground/25" />
          <p className="mt-3 text-sm uppercase tracking-[0.16em] text-foreground/40">No codes yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {codes.map((code) => (
            <DiscountCodeRow key={code.id} code={code} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscountCodeRow({ code }: { code: DiscountCode }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleDiscountCodeAction(code.id, !code.isActive);
      if (result.error) toast.error(result.error);
      else toast.success(code.isActive ? "Code deactivated." : "Code activated ✦");
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete code "${code.code}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteDiscountCodeAction(code.id);
      if (result.error) toast.error(result.error);
      else toast.success("Code deleted.");
    });
  };

  const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date();

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card/45 px-4 py-3 transition-colors",
      !code.isActive && "opacity-55"
    )}>
      <code className="font-mono text-sm font-bold tracking-widest text-foreground">
        {code.code}
      </code>

      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
        {code.type === "percent" ? `${code.value}% off` : `₹${code.value} off`}
      </span>

      {code.minOrder > 0 && (
        <span className="text-[11px] text-foreground/50">min ₹{code.minOrder}</span>
      )}

      <span className="text-[11px] text-foreground/50">
        {code.usedCount}{code.maxUses !== null ? `/${code.maxUses}` : ""} uses
      </span>

      {isExpired && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">
          Expired
        </span>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="rounded-lg p-1.5 text-foreground/50 transition-colors hover:bg-card hover:text-foreground"
          title={code.isActive ? "Deactivate" : "Activate"}
        >
          {code.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg p-1.5 text-foreground/50 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Gift Cards Panel ──────────────────────────────────────────────────────────

function GiftCardsPanel({ giftCards }: { giftCards: GiftCard[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ value: "", recipientEmail: "", expiresAt: "" });
  const [isPending, startTransition] = useTransition();
  const [newCode, setNewCode] = useState<string | null>(null);

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createGiftCardAction({
        value: Number(form.value),
        recipientEmail: form.recipientEmail,
        expiresAt: form.expiresAt || null,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        setNewCode(result.code ?? null);
        toast.success("Gift card created ✦");
        setShowForm(false);
        setForm({ value: "", recipientEmail: "", expiresAt: "" });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{giftCards.length} card{giftCards.length !== 1 ? "s" : ""} issued</p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5" />
          Issue Gift Card
        </Button>
      </div>

      {newCode && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">Gift card created ✦</p>
          <code className="font-mono text-lg font-bold tracking-[0.12em] text-foreground">{newCode}</code>
          <p className="text-xs text-foreground/50 mt-1">Copy this code — it will not be shown again.</p>
          <button onClick={() => setNewCode(null)} className="mt-3 text-xs text-foreground/40 hover:text-foreground">Dismiss</button>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-border/70 bg-card/50 p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">New Gift Card</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">Value (₹)</Label>
              <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="500" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em]">Recipient Email</Label>
              <Input type="email" value={form.recipientEmail} onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))} placeholder="recipient@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em]">Expires At</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={isPending || !form.value || !form.recipientEmail}>
              {isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : "Create Gift Card ✦"}
            </Button>
          </div>
        </div>
      )}

      {giftCards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 py-10 text-center">
          <Gift className="mx-auto h-8 w-8 text-foreground/25" />
          <p className="mt-3 text-sm uppercase tracking-[0.16em] text-foreground/40">No gift cards issued yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {giftCards.map((card) => {
            const isExpired = card.expiresAt && new Date(card.expiresAt) < new Date();
            return (
              <div key={card.id} className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card/45 px-4 py-3",
                (card.isRedeemed || isExpired) && "opacity-50"
              )}>
                <code className="font-mono text-sm font-bold tracking-widest">{card.code}</code>
                <span className="text-[11px] text-foreground/50">₹{card.remainingValue} / ₹{card.initialValue}</span>
                <span className="text-[11px] text-foreground/50 truncate max-w-[180px]">{card.recipientEmail}</span>
                {card.isRedeemed && (
                  <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/50">Redeemed</span>
                )}
                {isExpired && !card.isRedeemed && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">Expired</span>
                )}
                {!card.isRedeemed && !isExpired && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-green-700">Active</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
