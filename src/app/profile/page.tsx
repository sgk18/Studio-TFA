import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import {
  ProfileOrderHistory,
  ProfileOrderHistorySkeleton,
} from "@/components/profile/ProfileOrderHistory";
import {
  ProfileSettingsForms,
  type ProfileAddressDraft,
} from "@/components/profile/ProfileSettingsForms";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "My Account | Studio TFA",
  description: "Review orders, manage addresses, and update your Studio TFA account settings.",
};

export const dynamic = "force-dynamic";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "full_name"
>;

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectedFrom=%2Fprofile");
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileRaw ?? null) as ProfileRow | null;
  const defaultShippingAddress =
    profileRaw && typeof profileRaw === "object" && !Array.isArray(profileRaw)
      ? (profileRaw as Record<string, unknown>).default_shipping_address
      : null;
  const initialAddress = parseDefaultShippingAddress((defaultShippingAddress as Json | null) ?? null);
  const displayName = profile?.full_name ?? "";
  const email = profile?.email ?? user.email ?? "";

  return (
    <div className="min-h-screen bg-[#FDF8F4] px-6 pb-16 pt-28 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-7 rounded-[1.7rem] border border-[rgba(139,38,62,0.12)] bg-[#FDF8F4] px-6 py-7 shadow-[0_24px_64px_rgba(139,38,62,0.08)] md:px-8">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Customer Profile</p>
          <h1 className="mt-2 font-heading text-5xl tracking-tight text-foreground md:text-6xl">My Account</h1>
          <p className="mt-3 font-sans text-sm text-foreground/72">Signed in as {email || "your account"}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-[1.45rem] border border-[rgba(139,38,62,0.12)] bg-[#FDF8F4] p-5 shadow-[0_16px_44px_rgba(139,38,62,0.08)] lg:sticky lg:top-28">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Sections</p>
            <nav className="mt-4 flex flex-col gap-2 font-sans">
              <a
                href="#order-history"
                className="rounded-full border border-border/70 bg-card/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
              >
                Order History
              </a>
              <a
                href="#saved-addresses"
                className="rounded-full border border-border/70 bg-card/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
              >
                Saved Addresses
              </a>
              <a
                href="#account-settings"
                className="rounded-full border border-border/70 bg-card/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
              >
                Account Settings
              </a>
            </nav>

            <Link href="/collections" className="mt-5 inline-flex action-pill-link text-xs">
              Continue Shopping
            </Link>
          </aside>

          <div className="space-y-6">
            <section
              id="order-history"
              className="scroll-mt-32 rounded-[1.55rem] border border-[rgba(139,38,62,0.12)] bg-[#FDF8F4] p-6 shadow-[0_18px_50px_rgba(139,38,62,0.08)] md:p-7"
            >
              <div className="mb-5">
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Order History</p>
                <h2 className="mt-2 font-heading text-3xl tracking-tight">Past Orders</h2>
                <p className="mt-2 font-sans text-sm text-foreground/70">
                  View your latest purchases and open invoice details for each order.
                </p>
              </div>

              <Suspense fallback={<ProfileOrderHistorySkeleton />}>
                <ProfileOrderHistory userId={user.id} />
              </Suspense>
            </section>

            <ProfileSettingsForms
              initialDisplayName={displayName}
              initialEmail={email}
              initialAddress={initialAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function parseDefaultShippingAddress(
  input: Json | null | undefined
): ProfileAddressDraft {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return emptyAddressDraft();
  }

  const record = input as Record<string, unknown>;

  return {
    fullName: stringFrom(record.full_name),
    phone: stringFrom(record.phone),
    line1: stringFrom(record.address_line_1),
    line2: stringFrom(record.address_line_2),
    city: stringFrom(record.city),
    state: stringFrom(record.state),
    postalCode: stringFrom(record.postal_code),
    country: stringFrom(record.country),
  };
}

function emptyAddressDraft(): ProfileAddressDraft {
  return {
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  };
}

function stringFrom(value: unknown): string {
  return typeof value === "string" ? value : "";
}
