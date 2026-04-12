import Link from "next/link";

import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { CartButton } from "./CartButton";

const navItems = [
  { label: "Collections", href: "/collections" },
  { label: "Books", href: "/collections/books" },
  { label: "Journals", href: "/collections/journals" },
  { label: "Artists Corner", href: "/artists-corner" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

export function Navbar({ isWholesale = false }: { isWholesale?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/78 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card/70 text-sm font-semibold tracking-[0.3em] text-primary shadow-[0_12px_30px_rgba(139,38,62,0.08)] transition-transform duration-300 group-hover:-translate-y-0.5">
            TFA
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[1.45rem] tracking-[0.16em] text-foreground">
              Studio TFA
            </span>
            <span className="mt-1 text-[0.72rem] uppercase tracking-[0.28em] text-foreground/60">
              Headless commerce
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-transparent px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:border-border/70 hover:bg-card/50 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <GlobalCommandPalette isWholesale={isWholesale} />
          <CartButton className="rounded-full border border-border/60 bg-card/65 px-3 py-2 text-foreground shadow-[0_12px_28px_rgba(139,38,62,0.08)] backdrop-blur-lg transition-transform duration-300 hover:-translate-y-0.5" />
        </div>
      </div>

      <div className="border-t border-border/50 px-4 py-2 lg:hidden">
        <nav className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-border/65 bg-card/45 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/72"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
