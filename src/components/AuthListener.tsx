"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * AuthListener — mounts in the root layout.
 *
 * Listens for SIGNED_IN events. On the very first sign-in (is_first_login = true,
 * welcome_email_sent = false), calls /api/send-welcome-email.
 *
 * Idempotent: the API route and Edge Function both guard against duplicate sends.
 */
export function AuthListener() {
  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== "SIGNED_IN" || !session) return;

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_first_login, welcome_email_sent")
            .eq("id", session.user.id)
            .single();

          // Only trigger on genuine first login
          if (profile?.is_first_login && !profile?.welcome_email_sent) {
            const firstName =
              (session.user.user_metadata?.full_name as string | undefined)
                ?.split(" ")[0] ?? "Friend";

            fetch("/api/send-welcome-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: session.user.id,
                email: session.user.email,
                firstName,
              }),
            }).catch((err) => {
              // Non-fatal — never let this crash the UI
              console.warn("[AuthListener] welcome email fetch failed:", err);
            });
          }
        } catch (err) {
          // Non-fatal
          console.warn("[AuthListener] profile check failed:", err);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
