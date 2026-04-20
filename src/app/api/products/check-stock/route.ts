/**
 * GET /api/products/check-stock?id=<product-id>&quantity=1
 *
 * Edge Runtime: runs at CDN edge for <50ms response.
 * Checks if a product has sufficient stock before checkout.
 */
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  const quantity = parseInt(searchParams.get("quantity") ?? "1", 10);

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  if (isNaN(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  // Use Supabase REST API directly (no SDK in Edge Runtime)
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&is_active=eq.true&is_archived=eq.false&select=id,stock,title`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Profile": "public",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ inStock: false, error: "Lookup failed" }, { status: 500 });
  }

  const rows = await res.json() as Array<{ id: string; stock: number; title: string }>;
  const product = rows[0];

  if (!product) {
    return NextResponse.json({ inStock: false, message: "Product not found" });
  }

  const inStock = product.stock >= quantity;

  return NextResponse.json({
    inStock,
    available: product.stock,
    requested: quantity,
    message: inStock
      ? "In stock"
      : product.stock === 0
        ? `${product.title} is currently out of stock`
        : `Only ${product.stock} left in stock`,
  }, {
    headers: {
      // Short cache: stock changes more frequently than product details
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
