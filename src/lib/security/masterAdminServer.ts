import "server-only";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  evaluateMasterAdminAccess,
  getClientIpFromHeaderGetter,
  getMasterAdminErrorMessage,
  type MasterAdminAccessDecision,
} from "@/lib/security/masterAdmin";

export type MasterAdminAccessResult = {
  decision: MasterAdminAccessDecision;
  message: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export async function verifyMasterAdminAccess(): Promise<MasterAdminAccessResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headerStore = await headers();
  const clientIp = getClientIpFromHeaderGetter((headerName) =>
    headerStore.get(headerName)
  );

  const decision = evaluateMasterAdminAccess({
    userEmail: user?.email,
    clientIp,
    masterAdminEmail: process.env.MASTER_ADMIN_EMAIL,
    allowedIpsRaw: process.env.MASTER_ADMIN_ALLOWED_IPS,
    environment: process.env.NODE_ENV,
  });

  return {
    decision,
    message: getMasterAdminErrorMessage(decision.reason),
    supabase,
  };
}

export async function requireMasterAdminAccess(): Promise<Awaited<ReturnType<typeof createClient>>> {
  const result = await verifyMasterAdminAccess();
  if (!result.decision.allowed) {
    throw new Error(result.message);
  }

  return result.supabase;
}
