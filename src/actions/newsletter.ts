"use server";

import { z } from "zod";

import { insertNewsletterSubscriber } from "@/lib/newsletterSubscribers";
import { createClient } from "@/lib/supabase/server";

export type NewsletterSubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialNewsletterSubscribeState: NewsletterSubscribeState = {
  status: "idle",
  message: "",
};

const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export async function subscribeNewsletterAction(
  _previousState: NewsletterSubscribeState,
  formData: FormData
): Promise<NewsletterSubscribeState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Invalid email address.",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = await createClient();

  const { error } = await insertNewsletterSubscriber(supabase, {
      email,
      source: "popup",
      status: "subscribed",
      metadata: {
        source_component: "NewsletterPopup",
      },
    });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "success",
        message: "You are already subscribed. We'll keep you in the loop.",
      };
    }

    if (error.code === "42P01") {
      return {
        status: "error",
        message:
          "Newsletter subscribers table is missing. Run the newsletter SQL upgrade before subscribing.",
      };
    }

    return {
      status: "error",
      message: error.message || "Unable to save your subscription right now.",
    };
  }

  return {
    status: "success",
    message: "You're subscribed. Check your inbox for future updates.",
  };
}
