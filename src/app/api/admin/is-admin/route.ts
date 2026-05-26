import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const serverSupabase = await createClient();

    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ isAdmin: false }, { status: 200 });

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = (profile as any)?.role === "admin";

    return NextResponse.json({ isAdmin: Boolean(isAdmin) }, { status: 200 });
  } catch (err) {
    console.error("[api/admin/is-admin] error:", err);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
