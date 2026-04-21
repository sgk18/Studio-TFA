import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Return null instead of throwing to prevent build-time crashes when secrets are missing
    return null as any;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    ...({ db: { poolMode: "transaction" } } as any),
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Prevent connection hoarding in serverless
      fetch: (url, options) => fetch(url, options),
    },
  });
}