import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  evaluateMasterAdminAccess,
  getClientIpFromHeaderGetter,
  getMasterAdminErrorMessage,
} from "@/lib/security/masterAdmin";
import {
  readAdminAccessSettings,
  recordDeniedAdminAccess,
} from "@/lib/security/adminAccessStore";

function redirectToAccessDenied(request: NextRequest, errorMessage?: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/access-denied";
  redirectUrl.searchParams.set("from", request.nextUrl.pathname);

  if (errorMessage) {
    redirectUrl.searchParams.set("error", errorMessage);
  }

  return NextResponse.redirect(redirectUrl);
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return supabaseResponse;
  }

  const clientIp = getClientIpFromHeaderGetter((headerName) =>
    request.headers.get(headerName)
  );

  const settings = await readAdminAccessSettings(
    supabase,
    process.env.MASTER_ADMIN_ALLOWED_IPS ?? null
  );
  const effectiveAllowedIpsRaw = settings.allowedIpsRaw;

  const decision = evaluateMasterAdminAccess({
    userEmail: user?.email,
    clientIp,
    masterAdminEmail: process.env.MASTER_ADMIN_EMAIL,
    allowedIpsRaw: effectiveAllowedIpsRaw,
    environment: process.env.NODE_ENV,
  });

  if (!decision.allowed) {
    await recordDeniedAdminAccess(supabase, {
      attemptedEmail: user?.email ?? null,
      ipAddress: clientIp || null,
      path: request.nextUrl.pathname,
      reason: decision.reason,
      userAgent: request.headers.get("user-agent"),
    });

    return redirectToAccessDenied(request, getMasterAdminErrorMessage(decision.reason));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
