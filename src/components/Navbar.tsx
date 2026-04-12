"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { CartButton } from "./CartButton";
import PillNav from "./PillNav";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/collections" },
  { label: "Artists Corner", href: "/artists-corner" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

const mobileItems = navItems;

export function Navbar({ isWholesale = false }: { isWholesale?: boolean }) {
  const pathname = usePathname();
  const isActiveHref = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const activeHref =
    navItems
      .filter((item) =>
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? "/";

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[rgba(139,38,62,0.12)] bg-[rgba(253,248,244,0.88)] backdrop-blur-[24px] backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          className="font-heading text-2xl tracking-[-0.02em] text-foreground transition-colors hover:text-primary md:hidden"
        >
          Studio TFA
        </Link>

        <div className="hidden min-w-0 flex-1 md:flex md:pr-8">
          <PillNav
            logo="/studio-tfa-mark.svg"
            logoAlt="Studio TFA Logo"
            items={navItems}
            activeHref={activeHref}
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="#292800"
            pillColor="#FDF8F4"
            hoveredPillTextColor="#FDF8F4"
            pillTextColor="#292800"
            theme="light"
            initialLoadAnimation={false}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
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
