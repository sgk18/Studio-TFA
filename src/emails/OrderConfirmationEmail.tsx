import * as React from "react";

export interface OrderConfirmationItem {
  title: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  items: OrderConfirmationItem[];
  total: number;
  subtotal?: number;
  discount?: number;
  shippingAmount?: number;
  premiumGiftingFee?: number;
}

export function buildOrderConfirmationSubject(orderId: string): string {
  return `Order Confirmed • ${orderId.slice(0, 8).toUpperCase()}`;
}

export function OrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
  subtotal,
  discount,
  shippingAmount,
  premiumGiftingFee,
}: OrderConfirmationEmailProps) {
  const hasBreakdown =
    typeof subtotal === "number" &&
    typeof discount === "number" &&
    typeof shippingAmount === "number" &&
    typeof premiumGiftingFee === "number";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body style={{ backgroundColor: "#FAF7F5", fontFamily: "Georgia, serif", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#FAF7F5", padding: "40px 20px" }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="600" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#FFFFFF", maxWidth: "600px", width: "100%" }}>
                  
                  {/* Header */}
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: "#292800", padding: "40px 48px", textAlign: "center" }}>
                        <p style={{ color: "#E0AEBA", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 8px" }}>
                          Studio TFA
                        </p>
                        <p style={{ color: "#ffffff", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, opacity: 0.5 }}>
                          A Christian Creative Studio
                        </p>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "48px" }}>
                        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: 400, color: "#111", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                          Order Confirmed.
                        </h1>
                        <p style={{ color: "#9CA3AF", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 32px" }}>
                          Thank you, {customerName}
                        </p>

                        <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: "1.7", margin: "0 0 32px" }}>
                          Your order has been received and is being prepared with care. 
                          Each piece from Studio TFA is packaged to reflect the intention behind it.
                        </p>

                        {/* Order ID */}
                        <div style={{ backgroundColor: "#FAF7F5", padding: "16px 20px", marginBottom: "32px" }}>
                          <p style={{ margin: 0, fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                            Order ID
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#111", fontWeight: "bold", fontFamily: "monospace" }}>
                            #{orderId.slice(0, 8).toUpperCase()}
                          </p>
                        </div>

                        {/* Items */}
                        <p style={{ fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 16px" }}>
                          Your Items
                        </p>
                        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderTop: "1px solid #E5E7EB", marginBottom: "32px" }}>
                          <tbody>
                            {items.map((item, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid #E5E7EB" }}>
                                <td style={{ padding: "14px 0", color: "#111", fontSize: "14px" }}>
                                  {item.title}
                                  <span style={{ color: "#9CA3AF", marginLeft: "8px", fontSize: "12px" }}>
                                    × {item.quantity}
                                  </span>
                                </td>
                                <td style={{ padding: "14px 0", textAlign: "right", color: "#111", fontSize: "14px", fontWeight: "bold" }}>
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {hasBreakdown ? (
                          <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "20px" }}>
                            <tbody>
                              <tr>
                                <td style={{ color: "#4B5563", fontSize: "13px", padding: "4px 0" }}>Subtotal</td>
                                <td style={{ color: "#111", fontSize: "13px", textAlign: "right", padding: "4px 0" }}>
                                  ₹{Number(subtotal).toLocaleString("en-IN")}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ color: "#4B5563", fontSize: "13px", padding: "4px 0" }}>Discount</td>
                                <td style={{ color: "#111", fontSize: "13px", textAlign: "right", padding: "4px 0" }}>
                                  -₹{Number(discount).toLocaleString("en-IN")}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ color: "#4B5563", fontSize: "13px", padding: "4px 0" }}>Shipping</td>
                                <td style={{ color: "#111", fontSize: "13px", textAlign: "right", padding: "4px 0" }}>
                                  {Number(shippingAmount) <= 0
                                    ? "Free"
                                    : `₹${Number(shippingAmount).toLocaleString("en-IN")}`}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ color: "#4B5563", fontSize: "13px", padding: "4px 0" }}>Premium gifting</td>
                                <td style={{ color: "#111", fontSize: "13px", textAlign: "right", padding: "4px 0" }}>
                                  {Number(premiumGiftingFee) <= 0
                                    ? "-"
                                    : `₹${Number(premiumGiftingFee).toLocaleString("en-IN")}`}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}

                        {/* Total */}
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #111", paddingTop: "16px" }}>
                          <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", letterSpacing: "0.2em", textTransform: "uppercase", color: "#111" }}>Total</p>
                          <p style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: "#8B263E" }}>₹{total.toLocaleString()}</p>
                        </div>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{ backgroundColor: "#FAF7F5", padding: "32px 48px", textAlign: "center", borderTop: "1px solid #E5E7EB" }}>
                        <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#9CA3AF" }}>
                          Questions? Email us at{" "}
                          <a href="mailto:fearlesslypursuing@gmail.com" style={{ color: "#D17484", textDecoration: "none" }}>
                            fearlesslypursuing@gmail.com
                          </a>
                        </p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.1em" }}>
                          Kothanur, Bangalore · Mon–Fri 9am–5pm
                        </p>
                        <p style={{ margin: "16px 0 0", fontSize: "11px", color: "#C4B9B5", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                          Studio TFA — Intentional Art, Rooted in Faith
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function buildOrderConfirmationText({
  orderId,
  customerName,
  items,
  total,
  subtotal,
  discount,
  shippingAmount,
  premiumGiftingFee,
}: OrderConfirmationEmailProps): string {
  const itemLines = items
    .map(
      (item) =>
        `- ${item.title} x${item.quantity}: ₹${(item.price * item.quantity).toLocaleString("en-IN")}`
    )
    .join("\n");

  const breakdown =
    typeof subtotal === "number" &&
    typeof discount === "number" &&
    typeof shippingAmount === "number" &&
    typeof premiumGiftingFee === "number"
      ? [
          `Subtotal: ₹${subtotal.toLocaleString("en-IN")}`,
          `Discount: -₹${discount.toLocaleString("en-IN")}`,
          `Shipping: ${shippingAmount <= 0 ? "Free" : `₹${shippingAmount.toLocaleString("en-IN")}`}`,
          `Premium gifting: ${premiumGiftingFee <= 0 ? "-" : `₹${premiumGiftingFee.toLocaleString("en-IN")}`}`,
        ].join("\n")
      : "";

  return [
    `Order Confirmed - ${orderId.slice(0, 8).toUpperCase()}`,
    "",
    `Thank you, ${customerName}.`,
    "Your Studio TFA order has been received and is being prepared with care.",
    "",
    "Items:",
    itemLines || "- No line items available",
    breakdown ? "" : null,
    breakdown || null,
    "",
    `Total: ₹${total.toLocaleString("en-IN")}`,
    "",
    "Need help? Reach us at fearlesslypursuing@gmail.com",
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}
