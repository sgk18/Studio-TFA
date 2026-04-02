import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Lock, RefreshCw, Save, ShieldAlert } from "lucide-react";

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
  readAdminAccessSettings,
} from "@/lib/security/adminAccessStore";
import { parseAllowedIps } from "@/lib/security/masterAdmin";
import { verifyMasterAdminAccess } from "@/lib/security/masterAdminServer";
import { clearAccessAuditLogs, saveAdminAllowlist } from "./actions";

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

  const access = await verifyMasterAdminAccess({ path: "/admin/access" });
  if (!access.decision.allowed) {
    redirect(
      `/login?error=${encodeURIComponent(access.message)}&redirectedFrom=/admin/access`
    );
  }

  const [settings, logs] = await Promise.all([
    readAdminAccessSettings(access.supabase, process.env.MASTER_ADMIN_ALLOWED_IPS ?? null),
    fetchDeniedAdminAccessLogs(access.supabase, 50),
  ]);

  const currentRules = parseAllowedIps(settings.allowedIpsRaw).join("\n");

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
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Back To Analytics
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
            >
              <Lock className="w-4 h-4" />
              Inventory
            </Link>
          </div>
        </div>

        {status === "saved" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-800">
            Allowlist saved successfully.
          </div>
        )}

        {status === "cleared" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-800">
            Access audit logs cleared.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/85 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-white/45">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Master Admin IP Allowlist</CardTitle>
              <CardDescription>
                Enter one rule per line. Supports exact IP, wildcard (e.g. 192.168.1.*), CIDR (e.g. 203.0.113.0/24), or *.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={saveAdminAllowlist} className="space-y-4">
                <Textarea
                  name="allowed_ips"
                  className="h-56 font-mono text-xs"
                  defaultValue={currentRules}
                  placeholder="127.0.0.1&#10;203.0.113.0/24"
                />
                <Button type="submit" className="uppercase tracking-widest text-xs font-bold">
                  <Save className="w-4 h-4 mr-2" />
                  Save Allowlist
                </Button>
              </form>

              <div className="rounded-xl border border-white/45 bg-white/30 p-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Active source: <strong>{settings.source}</strong>
                </p>
                <p>Detected IP for your current session: {access.clientIp || "Unavailable"}</p>
                {settings.updatedAt && <p>Last updated: {formatDate(settings.updatedAt)}</p>}
                {settings.errorMessage && (
                  <p className="text-amber-700 mt-2">
                    {settings.errorMessage}
                  </p>
                )}
                {access.allowlistErrorMessage && access.allowlistErrorMessage !== settings.errorMessage && (
                  <p className="text-amber-700 mt-2">
                    {access.allowlistErrorMessage}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/45">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Policy Summary</CardTitle>
              <CardDescription>Current effective admin access policy (IP-based).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-muted-foreground">Access mode</span>
                <span className="font-semibold truncate max-w-[60%] text-right">
                  IP only (no login)
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-muted-foreground">Allowlist source</span>
                <span className="font-semibold capitalize">{settings.source}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-muted-foreground">Total active rules</span>
                <span className="font-semibold">{parseAllowedIps(settings.allowedIpsRaw).length}</span>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-white/35 bg-white/30 p-3 text-xs text-muted-foreground">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  If database tables are missing, the app falls back to MASTER_ADMIN_ALLOWED_IPS from environment values.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
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
