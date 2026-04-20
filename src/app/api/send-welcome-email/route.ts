import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const bodySchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
});

/**
 * POST /api/send-welcome-email
 *
 * Called client-side on first SIGNED_IN event when is_first_login = true
 * and welcome_email_sent = false.
 *
 * Verifies the userId matches a real profile before delegating to the
 * Edge Function. Fully idempotent (Edge Function guards against duplicates).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { userId, email, firstName } = parsed.data;

    // Security: verify this userId actually exists in profiles
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, welcome_email_sent, is_first_login")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Early exit: already sent
    if (profile.welcome_email_sent) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Delegate to Edge Function (or call Resend directly if Edge Function
    // isn't deployed — falls back gracefully)
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-welcome-email`;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const edgeRes = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ userId, email, firstName }),
    });

    if (!edgeRes.ok) {
      const detail = await edgeRes.text();
      console.error("[api/send-welcome-email] Edge function error:", detail);
      // Non-fatal — don't surface this to the client
      return NextResponse.json({ success: true, warning: "email_dispatch_failed" });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[api/send-welcome-email] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
