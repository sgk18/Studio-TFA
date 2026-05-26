"use client";

import { useEffect, useState } from "react";
import { X, Mail, MapPin, Calendar, Clock, ShoppingBag, CreditCard, Shield, ShieldAlert, Key } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { fetchUserDetails } from "./actions";
import { type AdminUserRow } from "./UsersDataTable";
import { formatINR } from "@/lib/currency";

interface UserDetailsDrawerProps {
  user: AdminUserRow | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDrawer({ user, isOpen, onOpenChange }: UserDetailsDrawerProps) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      fetchUserDetails(user.id)
        .then((data) => {
          setDetails(data);
        })
        .catch((err) => {
          toast.error("Failed to load user details.");
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDetails(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/50 bg-[#FDF8F4] p-6 shadow-2xl transition-transform duration-500 sm:max-w-lg md:max-w-xl overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B263E]">Identity Profile</p>
            <h2 className="mt-1 font-heading text-3xl tracking-tight text-[#292800]">Account Details</h2>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 hover:bg-black/5 transition-colors"
          >
            <X className="h-5 w-5 text-[#292800]/60" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-32 w-full animate-pulse rounded-2xl bg-card/60" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-card/60" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-card/60" />
          </div>
        ) : details ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#E0AEBA]/40 bg-white p-6 shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield className="h-32 w-32 text-[#8B263E]" />
              </div>
              <div className="relative z-10 flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E0AEBA]/20 text-[#8B263E] font-heading font-bold text-2xl">
                  {(details.full_name?.[0] || details.email?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading text-2xl text-[#292800]">{details.full_name || "Unnamed user"}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-[#292800]/60">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{details.email}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-[#D17484]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B263E]">
                      {details.role}
                    </span>
                    {details.banned_until && new Date(details.banned_until) > new Date() && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-700">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[#292800]/50 mb-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Orders</span>
                </div>
                <p className="font-heading text-3xl text-[#292800]">{details.order_count}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[#292800]/50 mb-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Lifetime Value</span>
                </div>
                <p className="font-heading text-3xl text-[#292800]">{formatINR(details.total_spend)}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm space-y-5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#292800]/40">System Timestamps</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF8F4] text-[#786825]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#292800]">Account Created</p>
                    <p className="text-xs text-[#292800]/50">
                      {details.signup_date ? format(new Date(details.signup_date), "PPpp") : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF8F4] text-[#786825]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#292800]">Last Sign In</p>
                    <p className="text-xs text-[#292800]/50">
                      {details.last_sign_in_at ? format(new Date(details.last_sign_in_at), "PPpp") : "Never signed in"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF8F4] text-[#786825]">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#292800]">Auth Provider</p>
                    <p className="text-xs text-[#292800]/50 uppercase tracking-wider">
                      {details.provider || "Email"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {details.default_shipping_address && Object.keys(details.default_shipping_address).length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#292800]/40 mb-4">Default Address</h4>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#8B263E] mt-0.5 shrink-0" />
                  <div className="text-sm text-[#292800]/80 space-y-1">
                    <p>{details.default_shipping_address.name || details.full_name}</p>
                    <p>{details.default_shipping_address.line1}</p>
                    {details.default_shipping_address.line2 && <p>{details.default_shipping_address.line2}</p>}
                    <p>
                      {details.default_shipping_address.city}, {details.default_shipping_address.state} {details.default_shipping_address.postal_code}
                    </p>
                    <p>{details.default_shipping_address.country || 'India'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Raw Metadata Info (if any useful stuff) */}
            {details.user_metadata && Object.keys(details.user_metadata).length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#292800]/40 mb-4">Raw Metadata</h4>
                <pre className="text-[10px] overflow-x-auto bg-black/5 p-3 rounded-xl text-[#292800]/70 font-mono">
                  {JSON.stringify(details.user_metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-[#292800]/40">
            <ShieldAlert className="h-10 w-10 mb-4 opacity-50" />
            <p>Could not load user details.</p>
          </div>
        )}
      </div>
    </>
  );
}
