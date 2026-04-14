import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Img,
} from "@react-email/components";

type Props = {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrierName?: string;
  trackingUrl?: string;
};

export default function ShippingNotificationEmail({
  customerName,
  orderId,
  trackingNumber,
  carrierName = "Our Shipping Partner",
  trackingUrl,
}: Props) {
  const shortOrderId = orderId.slice(0, 8).toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>Your Studio TFA order #{shortOrderId} is on its way ✦</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>Studio TFA</Text>
            <Text style={taglineStyle}>The Fearlessly Authentic</Text>
          </Section>

          {/* Hero */}
          <Section style={heroStyle}>
            <Heading style={headingStyle}>
              Your order has shipped.
            </Heading>
            <Text style={bodyText}>
              Hi {customerName},
            </Text>
            <Text style={bodyText}>
              We are delighted to let you know that your order <strong>#{shortOrderId}</strong> has
              left the studio and is currently on its way to you.
            </Text>
            <Text style={bodyText}>
              Your pieces have been carefully wrapped and prepared for their journey.
              We hope they bring a sense of quiet beauty into your space.
            </Text>
          </Section>

          {/* Tracking Box */}
          <Section style={trackingBoxStyle}>
            <Text style={trackingLabelStyle}>Tracking Details</Text>
            <Text style={carrierStyle}>Shipped via {carrierName}</Text>
            <Text style={trackingNumberStyle}>{trackingNumber}</Text>

            {trackingUrl ? (
              <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
                <Link href={trackingUrl} style={buttonStyle}>
                  Track Your Package
                </Link>
              </Section>
            ) : null}
          </Section>

          <Section style={contentStyle}>
            <Text style={bodyText}>
              Please allow 24-48 hours for the tracking information to update on the carrier's website.
              If you have any questions regarding your delivery, simply reply to this email.
            </Text>

            <Text style={signatureStyle}>
              Warmly,
              <br />
              The Studio TFA Team
            </Text>
          </Section>

          <Hr style={hrStyle} />

          <Section style={footerStyle}>
            <Text style={footerText}>
              Studio TFA · Bengaluru, India
            </Text>
            <Text style={footerText}>
              Christ First, Always.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const bodyStyle = {
  backgroundColor: "#FDF8F4",
  fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif",
  margin: "0",
  padding: "40px 0",
};

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  border: "1px solid rgba(41,40,0,0.08)",
  borderRadius: "16px",
  overflow: "hidden",
};

const headerStyle = {
  backgroundColor: "#292800",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logoStyle = {
  fontFamily: "'Georgia', serif",
  fontSize: "28px",
  fontStyle: "italic",
  color: "#E0AEBA",
  margin: "0",
  letterSpacing: "0.04em",
};

const taglineStyle = {
  color: "rgba(253,248,244,0.45)",
  fontSize: "11px",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  margin: "6px 0 0",
};

const heroStyle = {
  padding: "48px 40px 8px",
};

const headingStyle = {
  fontFamily: "'Georgia', serif",
  fontSize: "28px",
  fontWeight: "400",
  color: "#292800",
  margin: "0 0 24px",
  lineHeight: "1.3",
};

const bodyText = {
  fontSize: "15px",
  color: "#4a3f35",
  lineHeight: "1.75",
  margin: "0 0 16px",
};

const trackingBoxStyle = {
  backgroundColor: "#FDF8F4",
  borderTop: "1px solid rgba(139,38,62,0.1)",
  borderBottom: "1px solid rgba(139,38,62,0.1)",
  padding: "32px 40px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const trackingLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "#8B263E",
  margin: "0 0 12px",
};

const carrierStyle = {
  fontSize: "14px",
  color: "#6b5c4e",
  margin: "0 0 4px",
};

const trackingNumberStyle = {
  fontSize: "24px",
  fontFamily: "monospace",
  fontWeight: "700",
  color: "#292800",
  letterSpacing: "0.05em",
  margin: "0",
};

const buttonStyle = {
  backgroundColor: "#292800",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  display: "inline-block",
};

const contentStyle = {
  padding: "8px 40px 40px",
};

const signatureStyle = {
  fontSize: "14px",
  color: "#4a3f35",
  lineHeight: "1.9",
  margin: "32px 0 0",
  paddingTop: "24px",
  borderTop: "1px solid rgba(41,40,0,0.08)",
};

const hrStyle = {
  borderColor: "rgba(41,40,0,0.08)",
  margin: "0",
};

const footerStyle = {
  padding: "24px 40px",
  backgroundColor: "#faf6f3",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "11px",
  color: "rgba(41,40,0,0.45)",
  letterSpacing: "0.08em",
  margin: "4px 0",
};
