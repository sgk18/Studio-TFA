"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function getSafeNextPath(value: FormDataEntryValue | null | undefined): string {
  if (typeof value !== "string") return "/";

  const nextPath = value.trim();
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  return nextPath;
}

function hasAcceptedLegal(formData: FormData): boolean {
  const value = formData.get("accept_legal");
  if (typeof value !== "string") return false;
  return value === "on" || value === "true" || value === "1";
}

async function getSiteUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

async function startGoogleOAuth(
  formData: FormData,
  fallbackRoute: "/login" | "/register"
) {
  const supabase = await createClient();
  const nextPath = getSafeNextPath(formData.get("next"));

  const siteUrl = await getSiteUrl();
  const callbackUrl = new URL("/auth/callback", `${siteUrl}/`);
  callbackUrl.searchParams.set("next", nextPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data?.url) {
    redirect(
      `${fallbackRoute}?error=${encodeURIComponent(
        error?.message || "Unable to start Google OAuth flow."
      )}`
    );
  }

  redirect(data.url);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = getSafeNextPath(formData.get("next"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&redirectedFrom=${encodeURIComponent(
        nextPath
      )}`
    );
  }

  redirect(nextPath);
}

export async function signUp(formData: FormData) {
  if (!hasAcceptedLegal(formData)) {
    redirect(
      `/register?error=${encodeURIComponent(
        "Please accept the Terms and Privacy Policy before creating an account."
      )}`
    );
  }

  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;

  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/register?success=check_email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithGoogle(formData: FormData) {
  if (!hasAcceptedLegal(formData)) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Please accept the Terms and Privacy Policy before continuing with Google sign-in."
      )}`
    );
  }

  await startGoogleOAuth(formData, "/login");
}

export async function signUpWithGoogle(formData: FormData) {
  if (!hasAcceptedLegal(formData)) {
    redirect(
      `/register?error=${encodeURIComponent(
        "Please accept the Terms and Privacy Policy before creating an account."
      )}`
    );
  }

  await startGoogleOAuth(formData, "/register");
}
