import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type RequireAdminAccessOptions = {
  from?: string;
};

export type AdminAccessContext = {
  supabase: SupabaseServerClient;
  userId: string;
  profile: Pick<ProfileRow, "id" | "email" | "full_name" | "role">;
};

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

  if (profileError || !profile || profile.role !== "admin") {
    redirect(
      `/access-denied?error=${encodeURIComponent(
        "Admin role required."
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
