import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
export type ProfileRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

type RequireAdminAccessOptions = {
  from?: string;
  allowedRoles?: ProfileRole[];
};

export type AdminAccessContext = {
  supabase: SupabaseServerClient;
  userId: string;
  profile: Pick<ProfileRow, "id" | "email" | "full_name" | "role">;
};

/**
 * Ensures the user is authenticated and has an authorized role (admin, staff, or wholesale by default).
 */
export async function requireAdminAccess(
  options?: RequireAdminAccessOptions
): Promise<AdminAccessContext> {
  const requestedPath = toSafePath(options?.from);
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/login?redirectedFrom=${encodeURIComponent(requestedPath)}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  // Default allowed roles for general admin dashboard access
  const allowed = options?.allowedRoles ?? ["admin", "staff", "wholesale"];

  if (profileError || !profile || !allowed.includes((profile as any).role)) {
    redirect(
      `/access-denied?error=${encodeURIComponent(
        "You do not have the required permissions to access this area."
      )}&from=${encodeURIComponent(requestedPath)}`
    );
  }

  return {
    supabase,
    userId: user.id,
    profile,
  };
}

function toSafePath(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/admin";
  }

  return path;
}
