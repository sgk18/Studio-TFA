"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAllowedIps } from "@/lib/security/masterAdmin";
import { requireMasterAdminAccess } from "@/lib/security/masterAdminServer";
import {
  clearDeniedAdminAccessLogs,
  upsertAdminAccessAllowedIps,
} from "@/lib/security/adminAccessStore";

function normalizeAllowedIpsInput(rawInput: string): string {
  return parseAllowedIps(rawInput.replace(/\r?\n/g, ",")).join(", ");
}

export async function saveAdminAllowlist(formData: FormData) {
  try {
    const supabase = await requireMasterAdminAccess({ path: "/admin/access" });

    const input = String(formData.get("allowed_ips") || "");
    const normalized = normalizeAllowedIpsInput(input);

    if (!normalized) {
      redirect(
        `/admin/access?error=${encodeURIComponent(
          "Enter at least one valid IP rule before saving."
        )}`
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const result = await upsertAdminAccessAllowedIps(supabase, {
      allowedIpsRaw: normalized,
      updatedBy: user?.id ?? null,
    });

    if (result.errorMessage) {
      redirect(`/admin/access?error=${encodeURIComponent(result.errorMessage)}`);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/access");
    revalidatePath("/admin/products");
    redirect("/admin/access?status=saved");
  } catch (error: any) {
    redirect(
      `/admin/access?error=${encodeURIComponent(
        error?.message || "Unable to save allowlist"
      )}`
    );
  }
}

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
