import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { safeDecodeQueryParam } from "@/lib/pageValidation";
import { requireAdminAccess } from "@/lib/security/adminRole";

import { sendNewsletterAction } from "./actions";

export const metadata = {
  title: "Newsletters | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminNewslettersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string; sent?: string; failed?: string }>;
}) {
  const [{ status, error, sent, failed }, { supabase, profile }] = await Promise.all([
    searchParams,
    requireAdminAccess({ from: "/admin/newsletters" }),
  ]);

  const [profileEmailsResult, guestEmailsResult] = await Promise.all([
    (supabase as any).from("profiles").select("email").not("email", "is", null),
    (supabase as any).from("orders").select("guest_email").not("guest_email", "is", null),
  ]);

  const profileEmails = ((profileEmailsResult.data ?? []) as Array<{ email: string | null }>)
    .map((row) => row.email)
    .filter((value): value is string => Boolean(value));

  const guestEmails = ((guestEmailsResult.data ?? []) as Array<{ guest_email: string | null }>)
    .map((row) => row.guest_email)
    .filter((value): value is string => Boolean(value));

  const audienceCount = new Set(
    [...profileEmails, ...guestEmails].map((value) => value.trim().toLowerCase())
  ).size;

  const errorMessage = safeDecodeQueryParam(error);
  const wasSent = status === "sent";
  const sentCount = Number(sent || "0");
  const failedCount = Number(failed || "0");

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          Campaign Operations
        </p>
        <h2 className="mt-2 font-heading text-5xl tracking-tight">Newsletters</h2>
        <p className="mt-3 max-w-3xl text-sm text-foreground/70">
          Send one-off email campaigns via Resend to your current audience or a custom email list.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {wasSent ? (
        <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Newsletter sent. Delivered to {Number.isFinite(sentCount) ? sentCount : 0} recipients
          {Number.isFinite(failedCount) && failedCount > 0
            ? `, with ${failedCount} failed deliveries.`
            : "."}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Send Newsletter</CardTitle>
          <p className="text-sm text-muted-foreground">
            Logged in as {profile.full_name || profile.email || "admin"}. Audience currently includes approximately {audienceCount} unique email addresses.
          </p>
        </CardHeader>
        <CardContent>
          <form action={sendNewsletterAction} className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Recipients
              </legend>

              <label className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/45 px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="recipient_mode"
                  value="audience"
                  defaultChecked
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="font-semibold">Audience</span>
                  <span className="block text-xs text-muted-foreground">
                    Sends to all profile emails plus guest checkout emails.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/45 px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="recipient_mode"
                  value="custom"
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="font-semibold">Custom list</span>
                  <span className="block text-xs text-muted-foreground">
                    Use the field below for comma or newline-separated emails.
                  </span>
                </span>
              </label>
            </fieldset>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Custom recipients (optional)
              </label>
              <textarea
                name="custom_recipients"
                rows={3}
                placeholder="name@example.com, second@example.com"
                className="w-full rounded-xl border border-border/70 bg-card/55 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                required
                minLength={3}
                maxLength={140}
                placeholder="A new Studio TFA collection is live"
                className="w-full rounded-xl border border-border/70 bg-card/55 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Preview text (optional)
              </label>
              <input
                type="text"
                name="preview_text"
                maxLength={180}
                placeholder="A quiet update from the studio"
                className="w-full rounded-xl border border-border/70 bg-card/55 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Message
              </label>
              <textarea
                name="message"
                required
                minLength={20}
                rows={10}
                placeholder="Write your newsletter message here. New lines are preserved in the email."
                className="w-full rounded-xl border border-border/70 bg-card/55 px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors focus:border-primary/60"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="rounded-full border border-primary/80 bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Send Newsletter
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
