import * as React from "react";

export interface WelcomeEmailProps {
  name: string;
  email: string;
  siteUrl: string;
}

export function WelcomeEmail({ name, email, siteUrl }: WelcomeEmailProps) {
  const firstName = name?.split(" ")[0] || "Friend";

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
                          A Christian Creative Studio
                        </p>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "52px 48px" }}>
                        <p style={{ color: "#9CA3AF", fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase", margin: "0 0 12px" }}>
                          Welcome
                        </p>
                        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: 400, color: "#111", margin: "0 0 6px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                          {firstName}.
                        </h1>
                        <p style={{ color: "#D17484", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 36px" }}>
                          Your account is ready.
                        </p>

                        <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: "1.8", margin: "0 0 20px" }}>
                          We're glad you're here. Studio TFA exists to create boldly minimalist,
                          Christ-centred art and lifestyle products that nurture identity, spark
                          conversations, and infuse homes with beauty and purpose.
                        </p>

                        <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: "1.8", margin: "0 0 36px" }}>
                          Your account was created for <strong style={{ color: "#111" }}>{email}</strong>.
                          Start exploring the collection below.
                        </p>

                        {/* CTA */}
                        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "40px" }}>
                          <tbody>
                            <tr>
                              <td>
                                <a
                                  href={`${siteUrl}/collections/all`}
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
                                  Explore the Collection →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Scripture */}
                        <div style={{ borderLeft: "3px solid #E0AEBA", paddingLeft: "20px", marginBottom: "8px" }}>
                          <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.7", fontStyle: "italic", margin: 0 }}>
                            "Whatever is true, whatever is noble, whatever is right, whatever is pure,
                            whatever is lovely… think about such things."
                          </p>
                          <p style={{ color: "#9CA3AF", fontSize: "12px", margin: "8px 0 0", letterSpacing: "0.1em" }}>
                            — Philippians 4:8
                          </p>
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

export function buildWelcomeEmailText(name: string, email: string): string {
  const firstName = name?.split(" ")[0] || "Friend";
  return [
    `Welcome to Studio TFA, ${firstName}.`,
    "",
    `Your account has been created for ${email}.`,
    "",
    "Studio TFA exists to create boldly minimalist, Christ-centred art and lifestyle",
    "products that nurture identity, spark conversations, and infuse homes with beauty.",
    "",
    `Explore the collection: ${process.env.NEXT_PUBLIC_SITE_URL}/collections/all`,
    "",
    "Questions? fearlesslypursuing@gmail.com",
    "",
    "— Studio TFA",
  ].join("\n");
}
