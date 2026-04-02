import type { MasterAdminAccessReason } from "@/lib/security/masterAdmin";

export const ADMIN_ACCESS_SETTINGS_TABLE = "admin_access_settings";
export const ADMIN_ACCESS_AUDIT_TABLE = "admin_access_audit";
const ADMIN_SETTINGS_ROW_ID = "singleton";

export type AdminAccessSettingsReadResult = {
  allowedIpsRaw: string | null;
  source: "database" | "environment";
  errorMessage: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type AdminAccessAuditRow = {
  id: number;
  created_at: string;
  attempted_email: string | null;
  ip_address: string | null;
  path: string | null;
  reason: string;
  user_agent: string | null;
};

function normalizeErrorMessage(error: any): string {
  if (!error) return "Unknown database error.";

  if (typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown database error.";
}

function isRelationMissingError(error: any): boolean {
  return error?.code === "42P01";
}

export async function readAdminAccessSettings(
  supabase: any,
  environmentFallbackAllowedIpsRaw: string | null
): Promise<AdminAccessSettingsReadResult> {
  const { data, error } = await supabase
    .from(ADMIN_ACCESS_SETTINGS_TABLE)
    .select("allowed_ips, updated_at, updated_by")
    .eq("id", ADMIN_SETTINGS_ROW_ID)
    .maybeSingle();

  if (error) {
    return {
      allowedIpsRaw: environmentFallbackAllowedIpsRaw,
      source: "environment",
      errorMessage: isRelationMissingError(error)
        ? "admin_access_settings table is missing. Run the SQL setup for Admin Access Control."
        : normalizeErrorMessage(error),
      updatedAt: null,
      updatedBy: null,
    };
  }

  const allowedIpsRaw =
    typeof data?.allowed_ips === "string" && data.allowed_ips.trim().length > 0
      ? data.allowed_ips
      : environmentFallbackAllowedIpsRaw;

  return {
    allowedIpsRaw,
    source: typeof data?.allowed_ips === "string" ? "database" : "environment",
    errorMessage: null,
    updatedAt: data?.updated_at ?? null,
    updatedBy: data?.updated_by ?? null,
  };
}

export async function upsertAdminAccessAllowedIps(
  supabase: any,
  options: { allowedIpsRaw: string; updatedBy: string | null }
): Promise<{ errorMessage: string | null }> {
  const { error } = await supabase.from(ADMIN_ACCESS_SETTINGS_TABLE).upsert(
    [
      {
        id: ADMIN_SETTINGS_ROW_ID,
        allowed_ips: options.allowedIpsRaw,
        updated_by: options.updatedBy,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "id" }
  );

  if (error) {
    return {
      errorMessage: isRelationMissingError(error)
        ? "Cannot save allowlist because admin_access_settings table is missing. Run the SQL setup first."
        : normalizeErrorMessage(error),
    };
  }

  return { errorMessage: null };
}

export async function recordDeniedAdminAccess(
  supabase: any,
  payload: {
    attemptedEmail: string | null;
    ipAddress: string | null;
    path: string | null;
    reason: MasterAdminAccessReason;
    userAgent: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from(ADMIN_ACCESS_AUDIT_TABLE).insert({
    attempted_email: payload.attemptedEmail,
    ip_address: payload.ipAddress,
    path: payload.path,
    reason: payload.reason,
    user_agent: payload.userAgent,
  });

  // Audit logging should never block access flow.
  if (error) {
    return;
  }
}

export async function fetchDeniedAdminAccessLogs(
  supabase: any,
  limit: number = 50
): Promise<{ rows: AdminAccessAuditRow[]; errorMessage: string | null }> {
  const { data, error } = await supabase
    .from(ADMIN_ACCESS_AUDIT_TABLE)
    .select("id, created_at, attempted_email, ip_address, path, reason, user_agent")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      rows: [],
      errorMessage: isRelationMissingError(error)
        ? "admin_access_audit table is missing. Run the SQL setup for audit logs."
        : normalizeErrorMessage(error),
    };
  }

  return { rows: (data ?? []) as AdminAccessAuditRow[], errorMessage: null };
}

export async function clearDeniedAdminAccessLogs(
  supabase: any
): Promise<{ errorMessage: string | null }> {
  const { error } = await supabase.from(ADMIN_ACCESS_AUDIT_TABLE).delete().gte("id", 0);

  if (error) {
    return {
      errorMessage: isRelationMissingError(error)
        ? "Cannot clear logs because admin_access_audit table is missing."
        : normalizeErrorMessage(error),
    };
  }

  return { errorMessage: null };
}
