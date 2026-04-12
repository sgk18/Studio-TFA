"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { CartButton } from "./CartButton";
import { motion } from "framer-motion";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/collections" },
  { label: "Community", href: "/community" },
];

const mobileItems = [...navItems, { label: "Login", href: "/login" }];

export function Navbar({ isWholesale = false }: { isWholesale?: boolean }) {
  const pathname = usePathname();
  const isActiveHref = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[rgba(139,38,62,0.12)] bg-[rgba(253,248,244,0.88)] backdrop-blur-[24px] backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo - Elegant Bodoni treatment */}
        <Link
          href="/"
          className="flex-shrink-0 font-heading text-2xl md:text-3xl tracking-[-0.02em] text-foreground transition-colors hover:text-primary"
        >
          Studio TFA
        </Link>

        {/* Center Links - Premium Editorial spacing */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navItems.map((item) => {
            const isActive = isActiveHref(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-primary text-foreground/80"
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-indicator"
                    className="absolute -bottom-2 left-1/2 h-[3px] w-6 -translate-x-1/2 bg-primary rounded-full"
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
          <div className="hidden md:flex items-center gap-4 border-r border-border/40 pr-4">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:text-primary"
            >
              Login
            </Link>
          </div>

          <GlobalCommandPalette isWholesale={isWholesale} />

          <CartButton className="group relative flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:text-primary" />
        </div>
      </div>

      {/* Mobile nav links - simple bottom border scroll */}
      <div className="flex md:hidden items-center gap-6 overflow-x-auto px-6 py-3 border-t border-border/30 bg-background/50 backdrop-blur-md hide-scrollbar">
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
              isActiveHref(item.href) ? "text-primary" : "text-foreground/75"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
