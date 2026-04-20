import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // 1. IP Whitelisting Check
    const allowedIpsStr = process.env.AUTHORIZED_ADMIN_IPS || '';
    if (allowedIpsStr) {
      const allowedIps = allowedIpsStr.split(',').map(ip => ip.trim());
      const clientIp = request.ip || request.headers.get('x-forwarded-for') || '';
      
      // If clientIp is actually a list (x-forwarded-for can be), take the first one
      const ipToCheck = clientIp.split(',')[0]?.trim();
      
      if (ipToCheck && !allowedIps.includes(ipToCheck) && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/access-denied?error=ip_unauthorized', request.url));
      }
    }

    // 2. Role Check
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL(`/login?redirectedFrom=${encodeURIComponent(pathname)}`, request.url));
    }

    // Since we can't easily check 'profiles' table role at the edge without a direct DB call or a custom JWT claim,
    // we'll rely on the server-side Page-level `requireAdminAccess` for the final definitive role check.
    // However, we've secured the "Is Authenticated" and "IP Whitelisted" gates here.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
