import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSafeNextPath(nextValue: string | null): string {
  if (!nextValue) return "/";
  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) return "/";
  return nextValue;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNextPath(searchParams.get("next"));
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabaseWithResponse = createServerClient(
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
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabaseWithResponse.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  // Fallback redirect on failure
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
