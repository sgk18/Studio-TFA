
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { 
  getOrderConfirmationTemplate, 
  getShippingNotificationTemplate, 
  getAbandonedCartTemplate, 
  getAdminCommissionTemplate, 
  getReviewReplyTemplate, 
  getGiftCardTemplate 
} from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const resendFetch = async (payload: any) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const { type, record, old_record } = await req.json();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let emailPayload: any = null;

    switch (type) {
      case "order_confirmation": {
        const orderId = record.id;
        const customerEmail = record.guest_email || (record.shipping_address as any)?.email;
        if (!customerEmail) throw new Error("No customer email found");

        const html = getOrderConfirmationTemplate({
          orderId,
          total: record.total_amount || record.total,
          itemsCount: Array.isArray(record.line_items || record.items) ? (record.line_items || record.items).length : 0,
          customerEmail,
        });

        emailPayload = {
          from: "Studio TFA <orders@studiotfa.com>",
          to: customerEmail,
          subject: `Your order from Studio TFA ✦ #${orderId.slice(0, 8).toUpperCase()}`,
          html,
        };
        break;
      }

      case "shipping_notification": {
        if (record.status !== "shipped" || !record.tracking_number) return new Response("Ignored: Not shipped or no tracking");
        
        const customerEmail = record.guest_email || (record.shipping_address as any)?.email;
        const customerName = (record.shipping_address as any)?.full_name || "Valued Customer";
        
        const html = getShippingNotificationTemplate({
          orderId: record.id,
          trackingNumber: record.tracking_number,
          customerName,
        });

        emailPayload = {
          from: "Studio TFA <orders@studiotfa.com>",
          to: customerEmail,
          subject: "Your Studio TFA order is on its way ✦",
          html,
        };
        break;
      }

      case "admin_commission_alert": {
        const adminEmail = Deno.env.get("MASTER_ADMIN_EMAIL") || "admin@studiotfa.com";
        const html = getAdminCommissionTemplate({
          customerName: record.full_name,
          vision: record.vision,
          price: record.estimated_price || 0,
          adminUrl: "https://studiotfa.com/admin/commissions",
        });

        emailPayload = {
          from: "Studio TFA System <system@studiotfa.com>",
          to: adminEmail,
          subject: `New custom commission request from ${record.full_name}`,
          html,
        };
        break;
      }

      case "review_reply": {
        if (!record.admin_reply || (old_record && old_record.admin_reply === record.admin_reply)) return new Response("Ignored: No reply change");

        // Fetch user email from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", record.user_id)
          .single();

        if (!profile?.email) throw new Error("Reviewer email not found");

        const html = getReviewReplyTemplate({
          customerName: profile.full_name || "there",
          reply: record.admin_reply,
          productUrl: `https://studiotfa.com/product/${record.product_id}`,
        });

        emailPayload = {
          from: "Sherlin from Studio TFA <hello@studiotfa.com>",
          to: profile.email,
          subject: "Sherlin replied to your review ✦",
          html,
        };
        break;
      }

      case "gift_card_delivery": {
        const html = getGiftCardTemplate({
          customerName: "Gift Recipient",
          code: record.code,
          value: record.initial_value || record.remaining_value,
          expiryDate: record.expires_at ? new Date(record.expires_at).toLocaleDateString() : "Never",
        });

        emailPayload = {
          from: "Studio TFA <gifts@studiotfa.com>",
          to: record.recipient_email,
          subject: "Someone sent you a Studio TFA gift ✦",
          html,
        };
        break;
      }

      case "abandoned_cart_recovery": {
        // This is called by pg_cron with a slightly different payload or expects to scan
        // For simplicity, pg_cron can send the specific recovery record ID
        const { data: recoveryRecord } = await supabase
          .from("abandoned_carts")
          .select("*, profiles(email, full_name)")
          .eq("id", record.id)
          .single();

        if (!recoveryRecord || recoveryRecord.email_sent) return new Response("Already sent or not found");

        const email = recoveryRecord.profiles?.email || recoveryRecord.guest_email;
        if (!email) throw new Error("No target email for abandoned cart");

        const html = getAbandonedCartTemplate({
          customerName: recoveryRecord.profiles?.full_name || "there",
          cartUrl: "https://studiotfa.com/cart",
        });

        emailPayload = {
          from: "Studio TFA <hello@studiotfa.com>",
          to: email,
          subject: "You left something beautiful behind ✦",
          html,
        };

        // Mark as sent
        await supabase.from("abandoned_carts").update({ email_sent: true }).eq("id", record.id);
        break;
      }

      case "recovery_cron": {
        // Scan for abandoned carts > 24h old and not sent
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: carts } = await supabase
          .from("abandoned_carts")
          .select("id")
          .lt("updated_at", twentyFourHoursAgo)
          .eq("email_sent", false);

        if (carts && carts.length > 0) {
          // Send internal requests to this same function for each cart
          // This avoids timing out the cron job
          for (const cart of carts) {
            fetch(`${SUPABASE_URL}/functions/v1/email-service`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({ type: "abandoned_cart_recovery", record: { id: cart.id } }),
            });
          }
        }
        return new Response(`Processed ${carts?.length || 0} potential recoveries`);
      }

      default:
        return new Response("Unknown type", { status: 400 });
    }

    if (emailPayload) {
      const result = await resendFetch(emailPayload);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Batch processed or ignored");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
