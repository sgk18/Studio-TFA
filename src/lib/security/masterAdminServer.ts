import "server-only";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  evaluateMasterAdminAccess,
  getClientIpFromHeaderGetter,
  getMasterAdminErrorMessage,
  type MasterAdminAccessDecision,
} from "@/lib/security/masterAdmin";
import {
  readAdminAccessSettings,
  recordDeniedAdminAccess,
} from "@/lib/security/adminAccessStore";

export type MasterAdminAccessResult = {
  decision: MasterAdminAccessDecision;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headerStore = await headers();
  const clientIp = getClientIpFromHeaderGetter((headerName) =>
    headerStore.get(headerName)
  );

  let effectiveAllowedIpsRaw = process.env.MASTER_ADMIN_ALLOWED_IPS ?? null;
  let allowlistSource: "database" | "environment" = "environment";
  let allowlistErrorMessage: string | null = null;

  const settings = await readAdminAccessSettings(
    supabase,
    process.env.MASTER_ADMIN_ALLOWED_IPS ?? null
  );
  effectiveAllowedIpsRaw = settings.allowedIpsRaw;
  allowlistSource = settings.source;
  allowlistErrorMessage = settings.errorMessage;

  const decision = evaluateMasterAdminAccess({
    userEmail: user?.email,
    clientIp,
    masterAdminEmail: process.env.MASTER_ADMIN_EMAIL,
    allowedIpsRaw: effectiveAllowedIpsRaw,
    environment: process.env.NODE_ENV,
  });

  if (!decision.allowed && options?.logDeniedAttempt !== false) {
    await recordDeniedAdminAccess(supabase, {
      attemptedEmail: user?.email ?? null,
      ipAddress: clientIp || null,
      path: options?.path ?? null,
      reason: decision.reason,
      userAgent: headerStore.get("user-agent"),
    });
  }

  return {
    decision,
    message: getMasterAdminErrorMessage(decision.reason),
    supabase,
    clientIp,
    allowlistSource,
    allowlistErrorMessage,
  };
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
