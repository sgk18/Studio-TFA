import { NextResponse } from "next/server";

import { verifyMasterAdminAccess } from "@/lib/security/masterAdminServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await verifyMasterAdminAccess({
    path: "/api/admin/access-status",
    logDeniedAttempt: false,
  });

  return NextResponse.json(
    {
      allowed: result.decision.allowed,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
