import "server-only";

import { createClient } from "@/utils/supabase/server";
import { requireAdminAccess } from "@/lib/security/adminRole";

type RoleBasedDecision =
  | { allowed: true; reason: "allowed" }
  | { allowed: false; reason: "not-admin" };

export type MasterAdminAccessResult = {
  decision: RoleBasedDecision;
  message: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  clientIp: string;
  allowlistSource: "database" | "environment";
  allowlistErrorMessage: string | null;
};

export async function verifyMasterAdminAccess(options?: {
  path?: string;
  logDeniedAttempt?: boolean;
}): Promise<MasterAdminAccessResult> {
  const supabase = await createClient();

  try {
    await requireAdminAccess({
      from: options?.path ?? "/admin",
      allowedRoles: ["admin"],
    });

    return {
      decision: { allowed: true, reason: "allowed" },
      message: "Access granted.",
      supabase,
      clientIp: "",
      allowlistSource: "environment",
      allowlistErrorMessage: null,
    };
  } catch {
    return {
      decision: { allowed: false, reason: "not-admin" },
      message: "Admin role required.",
      supabase,
      clientIp: "",
      allowlistSource: "environment",
      allowlistErrorMessage: null,
    };
  }
}

export async function requireMasterAdminAccess(options?: {
  path?: string;
  logDeniedAttempt?: boolean;
}): Promise<Awaited<ReturnType<typeof createClient>>> {
  const result = await verifyMasterAdminAccess(options);
  if (!result.decision.allowed) {
    throw new Error(result.message);
  }

  return result.supabase;
}
