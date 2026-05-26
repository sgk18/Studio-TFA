"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMasterAdminAccess } from "@/lib/security/masterAdminServer";
import {
  clearDeniedAdminAccessLogs,
} from "@/lib/security/adminAccessStore";

export async function clearAccessAuditLogs() {
  try {
    const supabase = await requireMasterAdminAccess({ path: "/admin/access" });

    const result = await clearDeniedAdminAccessLogs(supabase);
    if (result.errorMessage) {
      redirect(`/admin/access?error=${encodeURIComponent(result.errorMessage)}`);
    }

    revalidatePath("/admin/access");
    redirect("/admin/access?status=cleared");
  } catch (error: any) {
    redirect(
      `/admin/access?error=${encodeURIComponent(
        error?.message || "Unable to clear access logs"
      )}`
    );
  }
}
