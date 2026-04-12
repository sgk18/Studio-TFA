import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/78 px-4 py-12 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="font-heading text-3xl tracking-[0.16em] text-foreground sm:text-4xl">
            Studio TFA
          </p>
          <p className="max-w-lg text-sm leading-6 text-foreground/72 sm:text-base">
            A headless commerce foundation for editorial storefronts, intentional branding, and production-ready customer flows.
          </p>
        </div>

        <nav aria-label="Footer legal links" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-foreground/72">
          <Link href="/terms-of-service" className="transition-colors hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="transition-colors hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/shipping" className="transition-colors hover:text-primary">
            Shipping
          </Link>
          <Link href="/refunds" className="transition-colors hover:text-primary">
            Refunds
          </Link>
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-border/50 pt-6 text-xs uppercase tracking-[0.24em] text-foreground/55 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Studio TFA. All rights reserved.</p>
        <p>Designed for a premium commerce experience.</p>
      </div>
    </footer>
  );
}
