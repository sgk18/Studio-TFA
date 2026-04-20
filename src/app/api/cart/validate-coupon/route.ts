/**
 * GET /api/cart/validate-coupon?code=WELCOME10
 *
 * Edge Runtime: runs at CDN edge for <50ms response.
 * Validates a discount code and returns its value.
 */
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  // Use Supabase REST API directly (no SDK in Edge Runtime)
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/discount_codes?code=eq.${encodeURIComponent(code)}&is_active=eq.true&select=code,type,value,min_order,max_uses,used_count,expires_at`,
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
    return NextResponse.json({ valid: false, error: "Lookup failed" }, { status: 500 });
  }

  const rows = await res.json() as Array<{
    code: string;
    type: "percent" | "flat";
    value: number;
    min_order: number;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
  }>;

  const discount = rows[0];

  if (!discount) {
    return NextResponse.json({ valid: false, message: "Invalid or inactive code" });
  }

  // Check expiry
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, message: "This code has expired" });
  }

  // Check usage limit
  if (discount.max_uses !== null && discount.used_count >= discount.max_uses) {
    return NextResponse.json({ valid: false, message: "This code has reached its usage limit" });
  }

  return NextResponse.json({
    valid: true,
    code: discount.code,
    type: discount.type,
    value: discount.value,
    minOrder: discount.min_order,
  }, {
    headers: {
      // Cache edge-side for 60s — reduces DB pressure on popular codes
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
