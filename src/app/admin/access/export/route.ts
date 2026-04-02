import { NextResponse } from "next/server";

import { fetchDeniedAdminAccessLogs } from "@/lib/security/adminAccessStore";
import { requireMasterAdminAccess } from "@/lib/security/masterAdminServer";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

export async function GET() {
  try {
    const supabase = await requireMasterAdminAccess({
      path: "/admin/access/export",
    });

    const result = await fetchDeniedAdminAccessLogs(supabase, 5000);
    if (result.errorMessage) {
      return NextResponse.json({ error: result.errorMessage }, { status: 500 });
    }

    const header = [
      "id",
      "created_at",
      "attempted_email",
      "ip_address",
      "path",
      "reason",
      "user_agent",
    ];

    const rows = result.rows.map((row) => [
      row.id,
      row.created_at,
      row.attempted_email,
      row.ip_address,
      row.path,
      row.reason,
      row.user_agent,
    ]);

    const csv = [
      header.map((cell) => csvCell(cell)).join(","),
      ...rows.map((row) => row.map((cell) => csvCell(cell)).join(",")),
    ].join("\n");

    const stamp = new Date().toISOString().replaceAll(":", "-");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"admin-access-audit-${stamp}.csv\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to export access logs." },
      { status: 500 }
    );
  }
}
