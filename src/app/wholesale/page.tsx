import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import {
  resolveDisplayPrice,
  isWholesaleRole,
  WHOLESALE_DISCOUNT_RATE,
  WHOLESALE_MIN_CART_ITEMS,
} from "@/lib/commerce";
import { formatINR } from "@/lib/currency";
import { resolveRoleForUserId } from "@/lib/security/viewerRole";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export const metadata = {
  title: "Wholesale Portal",
  description: "Private B2B ordering portal for approved Studio TFA wholesale partners.",
  robots: {
    index: false,
    follow: false,
  },
};

type WholesaleProduct = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "title" | "category" | "image_url" | "price"
>;

export default async function WholesalePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=%2Fwholesale");
  }

  const role = await resolveRoleForUserId(supabase, user.id);
  if (!isWholesaleRole(role)) {
    notFound();
  }

  const { data } = await supabase
    .from("products")
    .select("id, title, category, image_url, price")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(12);

  const products = ((data ?? []) as WholesaleProduct[]).map((product) => ({
    ...product,
    wholesalePrice: resolveDisplayPrice(Number(product.price) || 0, true),
  }));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <header className="glass-shell rounded-[1.5rem] p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">B2B Private Access</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">Wholesale Portal</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/70 md:text-base">
          Wholesale pricing is active across the storefront for your account. All approved products are discounted by {Math.round(WHOLESALE_DISCOUNT_RATE * 100)}%. Checkout requires at least {WHOLESALE_MIN_CART_ITEMS} items per order.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.length === 0 ? (
          <div className="glass-shell rounded-xl p-6 text-sm text-foreground/65">
            No active products are available for wholesale right now.
          </div>
        ) : (
          products.map((product) => (
            <article key={product.id} className="glass-shell rounded-xl p-3.5">
              <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-lg border border-border/70 bg-card/40">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/55">
                {product.category}
              </p>
              <h2 className="mt-1 font-heading text-2xl leading-tight">{product.title}</h2>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-foreground/50 line-through">{formatINR(product.price)}</p>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
                  {formatINR(product.wholesalePrice)}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
