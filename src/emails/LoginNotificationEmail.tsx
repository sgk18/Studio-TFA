import * as React from "react";

export interface LoginNotificationEmailProps {
  name: string;
  email: string;
  loginTime: string;       // Human-readable, e.g. "20 Apr 2026, 08:35 PM IST"
  method: "password" | "google" | "magic-link";
  siteUrl: string;
}

const METHOD_LABELS: Record<LoginNotificationEmailProps["method"], string> = {
  password: "Email & Password",
  google: "Google Sign-In",
  "magic-link": "Magic Link",
};

export function LoginNotificationEmail({
  name,
  email,
  loginTime,
  method,
  siteUrl,
}: LoginNotificationEmailProps) {
  const firstName = name?.split(" ")[0] || "there";

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
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{ backgroundColor: "#292800", padding: "40px 48px", textAlign: "center" }}>
                        <p style={{ color: "#E0AEBA", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 8px" }}>
                          Studio TFA
                        </p>
                        <p style={{ color: "#ffffff", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, opacity: 0.5 }}>
                          Security Notification
                        </p>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "52px 48px" }}>
                        <p style={{ color: "#9CA3AF", fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase", margin: "0 0 12px" }}>
                          New Sign-In
                        </p>
                        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 400, color: "#111", margin: "0 0 32px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                          Hi {firstName}, we noticed a new sign-in.
                        </h1>

                        <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: "1.8", margin: "0 0 32px" }}>
                          Your Studio TFA account was just accessed. If this was you, no action is needed.
                          If you don't recognise this, please{" "}
                          <a href={`mailto:fearlesslypursuing@gmail.com?subject=Unauthorized Sign-In&body=Account: ${email}`}
                            style={{ color: "#D17484" }}>
                            contact us immediately
                          </a>.
                        </p>

                        {/* Details block */}
                        <div style={{ backgroundColor: "#FAF7F5", padding: "24px 28px", marginBottom: "32px", borderLeft: "3px solid #E0AEBA" }}>
                          <table width="100%" cellPadding={0} cellSpacing={0}>
                            <tbody>
                              <tr>
                                <td style={{ color: "#9CA3AF", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", paddingBottom: "10px", width: "120px" }}>
                                  Account
                                </td>
                                <td style={{ color: "#111", fontSize: "13px", fontFamily: "monospace", paddingBottom: "10px" }}>
                                  {email}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ color: "#9CA3AF", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", paddingBottom: "10px" }}>
                                  Method
                                </td>
                                <td style={{ color: "#111", fontSize: "13px", paddingBottom: "10px" }}>
                                  {METHOD_LABELS[method]}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ color: "#9CA3AF", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                                  Time
                                </td>
                                <td style={{ color: "#111", fontSize: "13px" }}>
                                  {loginTime}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <p style={{ color: "#9CA3AF", fontSize: "13px", lineHeight: "1.6", margin: "0 0 28px" }}>
                          Not you? Secure your account by changing your password immediately.
                        </p>

                        {/* CTA */}
                        <table width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td>
                                <a
                                  href={`${siteUrl}/account/security`}
                                  style={{
                                    display: "inline-block",
                                    backgroundColor: "#292800",
                                    color: "#E0AEBA",
                                    fontSize: "11px",
                                    letterSpacing: "0.24em",
                                    textTransform: "uppercase",
                                    textDecoration: "none",
                                    padding: "16px 36px",
                                  }}
                                >
                                  Review Account Security →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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

export function buildLoginNotificationText(
  name: string,
  email: string,
  loginTime: string,
  method: LoginNotificationEmailProps["method"]
): string {
  const firstName = name?.split(" ")[0] || "there";
  return [
    `Hi ${firstName}, a new sign-in was detected on your Studio TFA account.`,
    "",
    `Account: ${email}`,
    `Method: ${METHOD_LABELS[method]}`,
    `Time: ${loginTime}`,
    "",
    "If this was you, no action is needed.",
    "If you don't recognise this sign-in, contact us immediately at fearlesslypursuing@gmail.com",
    "",
    "— Studio TFA",
  ].join("\n");
}
