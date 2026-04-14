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
} from "@react-email/components";

type Props = {
  reviewerName: string;
  productTitle: string;
  originalComment: string;
  adminReply: string;
};

export default function ReviewReplyEmail({
  reviewerName,
  productTitle,
  originalComment,
  adminReply,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Sherlin replied to your review ✦ — Studio TFA</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>Studio TFA</Text>
            <Text style={taglineStyle}>The Fearlessly Authentic</Text>
          </Section>

          <Section style={contentStyle}>
            <Heading style={headingStyle}>
              A personal reply from Sherlin ✦
            </Heading>

            <Text style={bodyText}>
              Hi {reviewerName},
            </Text>
            <Text style={bodyText}>
              Thank you so much for taking the time to leave your thoughts on{" "}
              <strong>{productTitle}</strong>. Your review means a great deal to
              us and to everyone who discovers this piece.
            </Text>

            {/* Original review */}
            <Section style={reviewBoxStyle}>
              <Text style={reviewLabelStyle}>Your review</Text>
              <Text style={reviewTextStyle}>
                "{originalComment || "No comment — rating only."}"
              </Text>
            </Section>

            {/* Admin reply */}
            <Section style={replyBoxStyle}>
              <Text style={replyLabelStyle}>Response from Sherlin ✦</Text>
              <Text style={replyTextStyle}>{adminReply}</Text>
            </Section>

            <Text style={bodyText}>
              We are so grateful to have you as part of the Studio TFA community.
              If you have any further questions, simply reply to this email.
            </Text>

            <Text style={signatureStyle}>
              With love &amp; gratitude,
              <br />
              Sherlin Bejoy
              <br />
              <em>Studio TFA Founder</em>
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
  padding: "0",
};

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
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

const contentStyle = {
  padding: "40px",
};

const headingStyle = {
  fontFamily: "'Georgia', serif",
  fontSize: "26px",
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

const reviewBoxStyle = {
  backgroundColor: "#FDF8F4",
  borderLeft: "3px solid rgba(139,38,62,0.25)",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
};

const reviewLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "#8B263E",
  margin: "0 0 8px",
};

const reviewTextStyle = {
  fontSize: "14px",
  color: "#6b5c4e",
  fontStyle: "italic",
  lineHeight: "1.7",
  margin: "0",
};

const replyBoxStyle = {
  backgroundColor: "rgba(224,174,186,0.12)",
  border: "1px solid rgba(224,174,186,0.4)",
  borderLeft: "3px solid #8B263E",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "8px 0 24px",
};

const replyLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "#8B263E",
  margin: "0 0 8px",
};

const replyTextStyle = {
  fontSize: "14px",
  color: "#292800",
  lineHeight: "1.75",
  margin: "0",
};

const signatureStyle = {
  fontSize: "14px",
  color: "#4a3f35",
  lineHeight: "1.9",
  margin: "24px 0 0",
  borderTop: "1px solid rgba(139,38,62,0.12)",
  paddingTop: "20px",
};

const hrStyle = {
  borderColor: "rgba(41,40,0,0.08)",
  margin: "0",
};

const footerStyle = {
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "11px",
  color: "rgba(41,40,0,0.38)",
  letterSpacing: "0.08em",
  margin: "2px 0",
};
