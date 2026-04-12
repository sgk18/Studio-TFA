import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { isWholesaleRole } from "@/lib/commerce";

type ProfileRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
type ServerClient = SupabaseClient<Database>;

export type ViewerRoleContext = {
  userId: string | null;
  role: ProfileRole | null;
  isWholesale: boolean;
};

export async function resolveRoleForUserId(
  supabase: ServerClient,
  userId: string
): Promise<ProfileRole | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile?.role) {
    return null;
  }

  return profile.role;
}

export async function resolveViewerRole(
  supabase: ServerClient
): Promise<ViewerRoleContext> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      userId: null,
      role: null,
      isWholesale: false,
    };
  }

  const role = await resolveRoleForUserId(supabase, user.id);

  return {
    userId: user.id,
    role,
    isWholesale: isWholesaleRole(role),
  };
}
