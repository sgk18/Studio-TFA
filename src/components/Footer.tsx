import Link from "next/link";

const footerLinks = [
  {
    heading: "Shop",
    links: [
      { label: "All Collections", href: "/collections" },
      { label: "Books", href: "/collections/books" },
      { label: "Journals", href: "/collections/journals" },
      { label: "Home Decor", href: "/collections/home-decor" },
      { label: "Gift Hampers", href: "/collections/gift-hampers" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "Artists Corner", href: "/artists-corner" },
      { label: "Community Gallery", href: "/community" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Shipping", href: "/shipping" },
      { label: "Refunds", href: "/refunds" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-background px-6 pt-20 pb-10 lg:px-14">
      {/* Top section */}
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">

          {/* Brand column */}
          <div className="md:col-span-5">
            <p className="font-heading text-5xl tracking-[-0.02em] text-foreground leading-none mb-6">
              Studio TFA
            </p>
            <p className="max-w-sm text-foreground/62 leading-relaxed" style={{ fontSize: "var(--type-sm)" }}>
              Elegant, boldly minimalist, Christ-centred art and lifestyle products
              that nurture identity and spark conversations.
            </p>

            {/* Subtle brand tag */}
            <div className="mt-8 flex items-center gap-3">
              <hr className="editorial-rule w-8" />
              <span className="overline opacity-60">Est. in faith</span>
            </div>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer navigation"
            className="md:col-span-7 grid grid-cols-3 gap-8"
          >
            {footerLinks.map((group) => (
              <div key={group.heading}>
                <p className="overline mb-5 opacity-70">{group.heading}</p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-foreground/62 transition-colors duration-200 hover:text-primary"
                        style={{ fontSize: "var(--type-sm)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 flex flex-col items-start gap-3 border-t border-border/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-foreground/45 uppercase tracking-[0.22em]"
            style={{ fontSize: "var(--type-xs)" }}
          >
            © {new Date().getFullYear()} Studio TFA. All rights reserved.
          </p>
          <p
            className="text-foreground/38 uppercase tracking-[0.22em]"
            style={{ fontSize: "var(--type-xs)" }}
          >
            Designed with intentionality.
          </p>
        </div>
      </div>
    </footer>
  );
}
