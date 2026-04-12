import Link from "next/link";
import { CartButton } from "./CartButton";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/78 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

        <CartButton className="rounded-full border border-border/60 bg-card/65 px-3 py-2 text-foreground shadow-[0_12px_28px_rgba(139,38,62,0.08)] backdrop-blur-lg transition-transform duration-300 hover:-translate-y-0.5" />
      </div>
    </header>
  );
}
