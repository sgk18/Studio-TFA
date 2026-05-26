import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const debugParam = url.searchParams.get("debug") === "1";

    const serverSupabase = await createClient();

    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      console.info("[api/admin/is-admin] no user (unauthenticated)", {
        headers: {
          ua: req.headers.get("user-agent"),
        },
      });

      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const admin = createAdminClient();
    if (!admin) {
      console.warn("[api/admin/is-admin] admin client not configured");
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[api/admin/is-admin] profile lookup error:", profileError);
    }

    const role = (profile as any)?.role ?? null;
    const isAdmin = role === "admin";

    // Log contextual info for debugging misreports
    console.info("[api/admin/is-admin] check", {
      userId: user.id,
      role,
      isAdmin,
      headers: {
        ua: req.headers.get("user-agent"),
        host: req.headers.get("host"),
      },
    });

    // If debug requested and not production, include role in response to aid debugging
    const allowDebugResponse = debugParam && process.env.NODE_ENV !== "production";

    if (allowDebugResponse) {
      return NextResponse.json({ isAdmin: Boolean(isAdmin), role }, { status: 200 });
    }

    return NextResponse.json({ isAdmin: Boolean(isAdmin) }, { status: 200 });
  } catch (err) {
    console.error("[api/admin/is-admin] error:", err);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
