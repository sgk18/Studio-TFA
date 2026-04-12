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
  isAdmin: boolean;
};

export async function resolveRoleForUserId(
  supabase: ServerClient,
  userId: string
): Promise<ProfileRole | null> {
  const profileQueryClient = supabase as unknown as {
    from: (table: "profiles") => {
      select: (columns: "role") => {
        eq: (column: "id", value: string) => {
          maybeSingle: () => Promise<{
            data: { role: ProfileRole | null } | null;
            error: { message?: string } | null;
          }>;
        };
      };
    };
  };

  const { data: profile, error } = await profileQueryClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile?.role) {
    return null;
  }

  return profile.role as ProfileRole;
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
      isAdmin: false,
    };
  }

  const role = await resolveRoleForUserId(supabase, user.id);

  return {
    userId: user.id,
    role,
    isWholesale: isWholesaleRole(role),
    isAdmin: role === "admin",
  };
}
