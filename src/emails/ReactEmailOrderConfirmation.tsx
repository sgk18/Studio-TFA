import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
} from "@react-email/components";

export interface ReactEmailOrderConfirmationProps {
  customerEmail: string;
  orderId: string;
  itemCount: number;
  totalAmount: number;
}

export function ReactEmailOrderConfirmation({
  customerEmail,
  orderId,
  itemCount,
  totalAmount,
}: ReactEmailOrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Order confirmed - Studio TFA #{orderId.slice(0, 8).toUpperCase()}</Preview>
      <Tailwind>
        <Body className="bg-[#fdf8f4] px-0 py-10 font-sans text-[#292800]">
          <Container className="mx-auto w-full max-w-[640px] px-4">
            <Section className="overflow-hidden rounded-[28px] border border-[#8b263e]/10 bg-white shadow-[0_24px_70px_rgba(139,38,62,0.08)]">
              <Section className="bg-[#292800] px-10 py-10 text-center">
                <Text className="m-0 text-[11px] font-bold uppercase tracking-[0.35em] text-[#E0AEBA]">
                  Studio TFA
                </Text>
                <Text className="mt-3 text-[11px] uppercase tracking-[0.28em] text-[#fdf8f4]/70">
                  Intentional Art, Rooted in Faith
                </Text>
              </Section>

              <Section className="px-10 py-10">
                <Heading className="m-0 font-serif text-4xl font-normal leading-tight text-[#111]">
                  Your order is confirmed.
                </Heading>
                <Text className="mt-3 text-sm uppercase tracking-[0.22em] text-[#9CA3AF]">
                  For {customerEmail}
                </Text>

                <Text className="mt-6 text-[15px] leading-7 text-[#4B5563]">
                  Thank you for shopping with Studio TFA. We have received your order and our studio is preparing it with care.
                </Text>

                <Section className="mt-8 rounded-2xl bg-[#FAF7F5] px-5 py-5">
                  <Text className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">
                    Order ID
                  </Text>
                  <Text className="mt-1 mb-0 font-mono text-sm font-bold text-[#111]">
                    #{orderId.slice(0, 8).toUpperCase()}
                  </Text>
                </Section>

                <Section className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-[#8b263e]/10 px-5 py-5">
                  <Section>
                    <Text className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">
                      Items
                    </Text>
                    <Text className="mt-1 mb-0 text-base font-semibold text-[#111]">
                      {itemCount} item{itemCount === 1 ? "" : "s"}
                    </Text>
                  </Section>
                  <Section>
                    <Text className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">
                      Total
                    </Text>
                    <Text className="mt-1 mb-0 text-base font-semibold text-[#8B263E]">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </Text>
                  </Section>
                </Section>

                <Hr className="my-8 border-[#E5E7EB]" />

                <Text className="text-[13px] leading-7 text-[#4B5563]">
                  If you have any questions, reply to this email and we’ll help you out.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
