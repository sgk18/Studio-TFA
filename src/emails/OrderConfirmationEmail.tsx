import * as React from "react";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
}

export function OrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
}: OrderConfirmationEmailProps) {
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
