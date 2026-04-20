"use server";

import * as React from "react";
import { resend } from "@/lib/resend";
import { WelcomeEmail, buildWelcomeEmailText } from "@/emails/WelcomeEmail";
import {
  LoginNotificationEmail,
  buildLoginNotificationText,
  type LoginNotificationEmailProps,
} from "@/emails/LoginNotificationEmail";

const FROM_ADDRESS = "Studio TFA <hello@studiotfa.com>";

function formatLoginTime(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) + " IST";
}

/**
 * Sends a Welcome Email to a newly signed-up user.
 * Call this immediately after supabase.auth.signUp() succeeds.
 */
export async function sendWelcomeEmail({
  name,
  email,
  siteUrl,
}: {
  name: string;
  email: string;
  siteUrl: string;
}): Promise<void> {
  try {
    const text = buildWelcomeEmailText(name, email);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Welcome to Studio TFA ✦",
      react: React.createElement(WelcomeEmail, { name, email, siteUrl }),
      text,
    });
  } catch (err) {
    // Non-fatal — never block the auth flow
    console.error("[Studio TFA] Failed to send welcome email:", err);
  }
}

/**
 * Sends a Login Notification Email when an existing user signs in.
 * Call this after a successful signInWithPassword() or OAuth callback.
 */
export async function sendLoginNotificationEmail({
  name,
  email,
  method,
  siteUrl,
}: {
  name: string;
  email: string;
  method: LoginNotificationEmailProps["method"];
  siteUrl: string;
}): Promise<void> {
  try {
    const loginTime = formatLoginTime();

    const text = buildLoginNotificationText(name, email, loginTime, method);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "New sign-in to your Studio TFA account",
      react: React.createElement(LoginNotificationEmail, {
        name,
        email,
        loginTime,
        method,
        siteUrl,
      }),
      text,
    });
  } catch (err) {
    // Non-fatal — never block the auth flow
    console.error("[Studio TFA] Failed to send login notification:", err);
  }
}
