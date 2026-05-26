import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Lock, RefreshCw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchDeniedAdminAccessLogs,
} from "@/lib/security/adminAccessStore";
import { verifyMasterAdminAccess } from "@/lib/security/masterAdminServer";
import { pickAllowedStatus, safeDecodeQueryParam } from "@/lib/pageValidation";
import { clearAccessAuditLogs } from "./actions";

export const metadata = {
  title: "Access Control | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const { status, error } = await searchParams;
  const statusState = pickAllowedStatus(status, ["saved", "cleared"] as const);
  const errorMessage = safeDecodeQueryParam(error);

  const access = await verifyMasterAdminAccess({ path: "/admin/access" });
  if (!access.decision.allowed) {
    redirect(
      `/access-denied?error=${encodeURIComponent(access.message)}&from=/admin/access`
    );
  }

  const logs = await fetchDeniedAdminAccessLogs(access.supabase, 50);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Admin Panel
            </p>
            <h1 className="font-heading text-4xl md:text-5xl tracking-tight">Access Control</h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Manage IP rules for admin access and inspect denied admin access attempts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="action-pill-link"
            >
              <RefreshCw className="w-4 h-4" />
              Back To Analytics
            </Link>
            <Link
              href="/admin/products"
              className="action-pill-link"
            >
              <Lock className="w-4 h-4" />
              Inventory
            </Link>
          </div>
        </div>

        {statusState === "cleared" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-800">
            Access audit logs cleared.
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50/85 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <Card className="border-white/45">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Access Policy</CardTitle>
            <CardDescription>
              Admin access is role-based only. No IP allowlist is used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Users with role <strong>admin</strong> can access protected admin routes.
          </CardContent>
        </Card>

        <Card className="border-white/45">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-heading text-2xl tracking-tight">Denied Access Audit</CardTitle>
                <CardDescription>
                  Latest blocked admin access attempts (most recent first).
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/access/export"
                  className="action-pill-link"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Link>
                <form action={clearAccessAuditLogs}>
                  <Button type="submit" variant="outline" className="uppercase tracking-widest text-xs font-bold">
                    Clear Logs
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logs.errorMessage && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-800 mb-4">
                {logs.errorMessage}
              </div>
            )}

            {logs.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No denied access attempts logged yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatDate(row.created_at)}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{row.attempted_email || "-"}</TableCell>
                      <TableCell>{row.ip_address || "-"}</TableCell>
                      <TableCell>{row.path || "-"}</TableCell>
                      <TableCell className="uppercase tracking-widest text-xs">{row.reason}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{row.user_agent || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
