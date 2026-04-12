"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";

import { fetchSubscribedNewsletterEmails } from "@/lib/newsletterSubscribers";
import { resend } from "@/lib/resend";
import { requireAdminAccess } from "@/lib/security/adminRole";
import type { Database } from "@/lib/supabase/types";

type AdminSupabase = SupabaseClient<Database>;

const newsletterSchema = z.object({
  recipient_mode: z.enum(["audience", "custom"]),
  custom_recipients: z.string().optional(),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(140),
  preview_text: z.string().trim().max(180).optional(),
  message: z.string().trim().min(20, "Message must be at least 20 characters.").max(12000),
});

const emailSchema = z.string().trim().email();

export async function sendNewsletterAction(formData: FormData) {
  const parsed = newsletterSchema.safeParse({
    recipient_mode: formData.get("recipient_mode"),
    custom_recipients: formData.get("custom_recipients"),
    subject: formData.get("subject"),
    preview_text: formData.get("preview_text"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    redirect(
      `/admin/newsletters?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Invalid newsletter form payload."
      )}`
    );
  }

  if (!process.env.RESEND_API_KEY) {
    redirect(
      `/admin/newsletters?error=${encodeURIComponent(
        "RESEND_API_KEY is missing. Add it in project environment variables before sending."
      )}`
    );
  }

  const { supabase, profile } = await requireAdminAccess({ from: "/admin/newsletters" });

  let recipients: string[];
  if (parsed.data.recipient_mode === "custom") {
    const custom = parseCustomRecipients(parsed.data.custom_recipients ?? "");
    if ("error" in custom) {
      const errorMessage = custom.error || "Unable to resolve custom recipients.";
      redirect(`/admin/newsletters?error=${encodeURIComponent(errorMessage)}`);
    }
    recipients = custom.recipients;
  } else {
    const audience = await resolveAudienceRecipients(supabase);
    if ("error" in audience) {
      const errorMessage = audience.error || "Unable to resolve audience recipients.";
      redirect(`/admin/newsletters?error=${encodeURIComponent(errorMessage)}`);
    }
    recipients = audience.recipients;
  }

  if (recipients.length === 0) {
    redirect(
      `/admin/newsletters?error=${encodeURIComponent(
        "No recipient emails were found for this send."
      )}`
    );
  }

  const html = buildNewsletterHtml({
    subject: parsed.data.subject,
    previewText: parsed.data.preview_text,
    message: parsed.data.message,
    senderName: profile.full_name || "Studio TFA Team",
  });

  const textMessage = `${parsed.data.message}\n\n- ${profile.full_name || "Studio TFA Team"}`;

  const sendResults = await Promise.allSettled(
    recipients.map((email) =>
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Studio TFA <onboarding@resend.dev>",
        to: [email],
        subject: parsed.data.subject,
        html,
        text: textMessage,
      })
    )
  );

  let sentCount = 0;
  let failedCount = 0;
  let firstErrorMessage = "";

  for (const result of sendResults) {
    if (result.status === "fulfilled") {
      if (!result.value.error) {
        sentCount += 1;
      } else {
        failedCount += 1;
        if (!firstErrorMessage) {
          firstErrorMessage = result.value.error.message || "Resend rejected one or more recipients.";
        }
      }
      continue;
    }

    failedCount += 1;
    if (!firstErrorMessage) {
      firstErrorMessage =
        result.reason instanceof Error
          ? result.reason.message
          : "Unexpected error while sending newsletter.";
    }
  }

  if (sentCount === 0) {
    redirect(
      `/admin/newsletters?error=${encodeURIComponent(
        firstErrorMessage || "Newsletter could not be sent to any recipients."
      )}`
    );
  }

  redirect(`/admin/newsletters?status=sent&sent=${sentCount}&failed=${failedCount}`);
}

async function resolveAudienceRecipients(supabase: AdminSupabase) {
  const subscribersResult = await fetchSubscribedNewsletterEmails(supabase);

  if (subscribersResult.error) {
    return {
      error:
        subscribersResult.error.code === "42P01"
          ? "Newsletter subscribers table is missing. Run the newsletter SQL upgrade first."
          : subscribersResult.error.message,
    } as const;
  }

  return {
    recipients: dedupeAndValidateEmails(subscribersResult.emails),
  } as const;
}

function parseCustomRecipients(raw: string) {
  const parts = raw
    .split(/[\n,;\s]+/g)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (parts.length === 0) {
    return {
      error: "Add at least one custom email address.",
    } as const;
  }

  const invalid = parts.filter((entry) => !emailSchema.safeParse(entry).success);
  if (invalid.length > 0) {
    const firstInvalid = invalid[0] || "unknown@example.com";
    return {
      error: `Invalid email address: ${firstInvalid}`,
    } as const;
  }

  return {
    recipients: dedupeAndValidateEmails(parts),
  } as const;
}

function dedupeAndValidateEmails(emails: string[]) {
  const seen = new Set<string>();
  const recipients: string[] = [];

  for (const email of emails) {
    const normalized = email.trim().toLowerCase();
    if (normalized.length === 0 || seen.has(normalized)) {
      continue;
    }

    if (!emailSchema.safeParse(normalized).success) {
      continue;
    }

    seen.add(normalized);
    recipients.push(normalized);
  }

  return recipients;
}

function buildNewsletterHtml(input: {
  subject: string;
  previewText?: string;
  message: string;
  senderName: string;
}) {
  const preview = input.previewText?.trim() || "A Studio TFA update for you.";
  const escapedSubject = escapeHtml(input.subject.trim());
  const escapedMessage = escapeHtml(input.message.trim()).replace(/\n/g, "<br />");
  const escapedSender = escapeHtml(input.senderName.trim());

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${escapedSubject}</title>
    </head>
    <body style="margin:0;padding:0;background:#fdf8f4;font-family:Arial,sans-serif;color:#292800;">
      <div style="max-width:640px;margin:0 auto;padding:24px;">
        <div style="background:#ffffff;border:1px solid rgba(139,38,62,0.12);border-radius:20px;overflow:hidden;">
          <div style="padding:28px;background:#292800;color:#fdf8f4;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#E0AEBA;">Studio TFA</p>
            <p style="margin:0;font-size:12px;line-height:1.5;opacity:0.85;">${escapeHtml(preview)}</p>
          </div>
          <div style="padding:28px;line-height:1.7;font-size:15px;">
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#111111;">${escapedSubject}</h1>
            <p style="margin:0;">${escapedMessage}</p>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Sent with care by ${escapedSender}</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
