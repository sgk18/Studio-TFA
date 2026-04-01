import { Resend } from "resend";

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production") {
  console.warn("[Studio TFA] RESEND_API_KEY is not set. Emails will not be sent.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
