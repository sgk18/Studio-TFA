import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function redirectToAccessDenied(request: NextRequest, errorMessage?: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/access-denied";
  redirectUrl.searchParams.set("from", request.nextUrl.pathname);

  if (errorMessage) {
    redirectUrl.searchParams.set("error", errorMessage);
  }

  return NextResponse.redirect(redirectUrl);
}

function redirectToLogin(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);

  return NextResponse.redirect(redirectUrl);
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return supabaseResponse;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // ─────────────────────────────────────
  // 1. IP Whitelisting Check (for production safety)
  // ─────────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const allowedIpsStr = process.env.AUTHORIZED_ADMIN_IPS || "";
    const isProduction = process.env.NODE_ENV === "production";

    if (allowedIpsStr && isProduction) {
      const allowedIps = allowedIpsStr.split(",").map((ip) => ip.trim());
      const clientIp = request.headers.get("x-forwarded-for") || request.ip || "";
      const ipToCheck = clientIp.split(",")[0]?.trim();

      if (ipToCheck && !allowedIps.includes(ipToCheck)) {
        console.warn(`Admin access denied for IP: ${ipToCheck}`);
        return redirectToAccessDenied(request, "IP unauthorized.");
      }
    }
  }

  if (userError || !user) {
    return redirectToLogin(request);
  }

  const { data: profile, error: profileError } = await (supabase as SupabaseClient<any>)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    return redirectToAccessDenied(request, "Admin role required.");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
