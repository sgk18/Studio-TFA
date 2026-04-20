import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://studiotfa.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, email, firstName } = await req.json() as {
      userId: string;
      email: string;
      firstName: string;
    };

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing userId or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // STEP 1: Guard — check if email already sent
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("welcome_email_sent, is_first_login")
      .eq("id", userId)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.welcome_email_sent) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "already_sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STEP 2: Fetch 3 featured products (highest price, not archived)
    const { data: featuredProducts } = await supabase
      .from("products")
      .select("title, image_url, price, id")
      .eq("is_archived", false)
      .eq("is_active", true)
      .order("price", { ascending: false })
      .limit(3);

    const safeFirstName = (firstName || "Friend").split(" ")[0];

    // STEP 3: Build the email HTML
    const productsHtml = (featuredProducts ?? [])
      .map(
        (p: { id: string; title: string; image_url: string | null; price: number }) => `
        <td style="width:33%;padding:0 8px;text-align:center;vertical-align:top;">
          <a href="${SITE_URL}/product/${p.id}" style="text-decoration:none;">
            ${p.image_url
              ? `<img src="${p.image_url}" alt="${p.title}" width="160" height="160"
                   style="width:160px;height:160px;object-fit:cover;border-radius:4px;display:block;margin:0 auto 10px;" />`
              : `<div style="width:160px;height:160px;background:#F3EDE8;border-radius:4px;margin:0 auto 10px;"></div>`
            }
            <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:13px;color:#111;line-height:1.4;">${p.title}</p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;letter-spacing:0.1em;">₹${Number(p.price).toLocaleString("en-IN")}</p>
          </a>
        </td>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="background-color:#FAF7F5;font-family:Georgia,serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#8B263E;padding:36px 48px;text-align:center;">
              <p style="color:#FFFFFF;font-size:22px;font-family:Georgia,serif;letter-spacing:0.12em;margin:0 0 4px;font-weight:400;">Studio TFA</p>
              <div style="width:40px;height:1px;background-color:#E0AEBA;margin:12px auto 0;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:52px 48px 36px;">
              <p style="color:#9CA3AF;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;margin:0 0 14px;">Welcome to the family</p>
              <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:400;color:#111;margin:0 0 32px;letter-spacing:-0.02em;line-height:1.25;">
                Hi ${safeFirstName}. ✦
              </h1>

              <p style="color:#4B5563;font-size:15px;line-height:1.85;margin:0 0 20px;">
                Welcome to Studio TFA — <em>The Fearlessly Authentic</em>. I'm Sherlin, and I'm so
                glad you're here. This isn't just a shop. It's a space where Christ-centred
                creativity meets your everyday life.
              </p>
              <p style="color:#4B5563;font-size:15px;line-height:1.85;margin:0 0 20px;">
                Every piece I create carries a story, a scripture, and a prayer that it finds
                exactly the home it was made for. I hope something here speaks to your heart.
              </p>

              <!-- Discount code -->
              <div style="background-color:#FAF7F5;border-left:3px solid #E0AEBA;padding:20px 24px;margin:32px 0;">
                <p style="margin:0 0 6px;font-size:11px;color:#9CA3AF;letter-spacing:0.22em;text-transform:uppercase;">Your Welcome Gift</p>
                <p style="margin:0 0 10px;font-size:26px;font-family:Georgia,serif;color:#8B263E;letter-spacing:0.08em;font-weight:400;">WELCOME10</p>
                <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">
                  10% off your first order. No minimum spend. Applied at checkout.
                </p>
              </div>

              <p style="color:#4B5563;font-size:15px;line-height:1.85;margin:0 0 36px;">
                Can't wait for you to explore. ✦
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
                <tr>
                  <td>
                    <a href="${SITE_URL}/collections/all"
                       style="display:inline-block;background-color:#292800;color:#E0AEBA;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;text-decoration:none;padding:16px 36px;">
                      Shop the Collection →
                    </a>
                  </td>
                </tr>
              </table>

              ${productsHtml ? `
              <!-- Featured Products -->
              <p style="font-size:11px;color:#9CA3AF;letter-spacing:0.22em;text-transform:uppercase;margin:0 0 20px;">A Few Favourites</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
                <tr>
                  ${productsHtml}
                </tr>
              </table>` : ""}

              <!-- Scripture -->
              <div style="border-left:3px solid #E0AEBA;padding-left:20px;margin-bottom:8px;">
                <p style="color:#6B7280;font-size:14px;line-height:1.7;font-style:italic;margin:0;">
                  "Whatever is true, whatever is noble, whatever is right, whatever is pure,
                  whatever is lovely… think about such things."
                </p>
                <p style="color:#9CA3AF;font-size:12px;margin:8px 0 0;letter-spacing:0.1em;">— Philippians 4:8</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#FAF7F5;padding:32px 48px;text-align:center;border-top:1px solid #E5E7EB;">
              <p style="margin:0 0 12px;font-size:12px;color:#9CA3AF;">
                <a href="https://instagram.com/studiotfa" style="color:#D17484;text-decoration:none;">Instagram</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="https://wa.me/919999999999" style="color:#D17484;text-decoration:none;">WhatsApp</a>
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;">
                Questions? <a href="mailto:fearlesslypursuing@gmail.com" style="color:#D17484;text-decoration:none;">fearlesslypursuing@gmail.com</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#C4B9B5;letter-spacing:0.15em;text-transform:uppercase;">
                You received this because you joined Studio TFA.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // STEP 4: Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sherlin from Studio TFA <hello@studiotfa.com>",
        to: email,
        subject: `Welcome to the family, ${safeFirstName} ✦`,
        html,
        text: `Hi ${safeFirstName},\n\nWelcome to Studio TFA — The Fearlessly Authentic.\n\nYour welcome gift: use code WELCOME10 for 10% off your first order.\n\nShop: ${SITE_URL}/collections/all\n\n— Sherlin, Studio TFA`,
      }),
    });

    if (!resendRes.ok) {
      const resendErr = await resendRes.text();
      console.error("[send-welcome-email] Resend error:", resendErr);
      return new Response(
        JSON.stringify({ error: "Failed to send email", detail: resendErr }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STEP 5: Mark as sent in DB
    await supabase
      .from("profiles")
      .update({ welcome_email_sent: true, is_first_login: false })
      .eq("id", userId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[send-welcome-email] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
