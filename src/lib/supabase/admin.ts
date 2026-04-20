import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    db: { poolMode: "transaction" },
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