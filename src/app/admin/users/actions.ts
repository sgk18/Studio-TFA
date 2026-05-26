"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/security/adminRole";
import { createAdminClient } from "@/lib/supabase/admin";

export async function fetchUsers(params: {
  page: number;
  search?: string;
  role?: string;
  status?: string;
  provider?: string;
}) {
  const { supabase } = await requireAdminAccess({
    from: "/admin/users",
    allowedRoles: ["admin"],
  });

  const PAGE_SIZE = 15;
  const page_offset = (Math.max(1, params.page) - 1) * PAGE_SIZE;

  // We rely on the get_admin_users RPC that we created via migration
  const { data, error } = await supabase.rpc("get_admin_users", {
    search_query: params.search || null,
    role_filter: params.role && params.role !== "all" ? params.role : null,
    status_filter: params.status && params.status !== "all" ? params.status : null,
    provider_filter: params.provider && params.provider !== "all" ? params.provider : null,
    page_limit: PAGE_SIZE,
    page_offset,
  });

  if (error) {
    throw new Error(error.message);
  }

  const users = data || [];
  const totalCount = users.length > 0 ? Number(users[0].total_count) : 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return { users, totalCount, totalPages };
}

export async function fetchUserDetails(userId: string) {
  const { supabase } = await requireAdminAccess({
    from: `/admin/users`,
    allowedRoles: ["admin"],
  });

  const { data, error } = await supabase.rpc("get_admin_user_details", {
    target_user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function toggleUserStatus(userId: string, statusAction: "enable" | "disable") {
  const parsedUserId = z.string().trim().min(1).max(128).safeParse(userId);
  if (!parsedUserId.success) {
    return { error: "Invalid user identifier." };
  }

  const { userId: actingAdminId } = await requireAdminAccess({
    from: "/admin/users",
    allowedRoles: ["admin"],
  });

  if (parsedUserId.data === actingAdminId) {
    return { error: "You cannot disable your own account." };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { error: "Admin operations are temporarily unavailable." };
  }

  // To disable, ban for 100 years. To enable, remove ban.
  const banDuration = statusAction === "disable" ? "876000h" : "none";
  
  const { error } = await adminClient.auth.admin.updateUserById(parsedUserId.data, {
    ban_duration: banDuration,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true, message: `User account has been ${statusAction}d.` };
}
