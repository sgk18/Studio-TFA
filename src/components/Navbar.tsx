"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound } from "lucide-react";

import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { CartButton } from "./CartButton";
import PillNav from "./PillNav";

const primaryNavItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/collections" },
  { label: "Artists Corner", href: "/artists-corner" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
  { label: "Wholesale", href: "/wholesale" },
];

const utilityNavItems = [
  { label: "Checkout", href: "/checkout" },
  { label: "Shipping", href: "/shipping" },
  { label: "Refunds", href: "/refunds" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export function Navbar({
  isWholesale = false,
  isAdmin = false,
  isAuthenticated = false,
}: {
  isWholesale?: boolean;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
}) {
  const pathname = usePathname();
  const authNavItems = isAuthenticated
    ? [{ label: "Profile", href: "/profile" }]
    : [
        { label: "Login", href: "/login" },
        { label: "Register", href: "/register" },
      ];

  const desktopNavItems = [
    ...primaryNavItems,
    isAuthenticated
      ? { label: "Profile", href: "/profile" }
      : { label: "Login", href: "/login" },
  ];

  const quickNavItems = [...utilityNavItems, ...authNavItems];

  const isActiveHref = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const activeHref =
    desktopNavItems
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
            items={desktopNavItems}
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

          {isAuthenticated ? (
            <Link
              href="/profile"
              aria-label="Profile"
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-border/70 bg-card/55 p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <CircleUserRound className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-border/70 bg-card/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            >
              Login
            </Link>
          )}

          <CartButton className="group relative flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:text-primary" />
        </div>
      </div>

      {/* Quick links strip for full page coverage */}
      <div className="flex items-center gap-6 overflow-x-auto border-t border-border/30 bg-background/50 px-6 py-3 backdrop-blur-md hide-scrollbar">
        {quickNavItems.map((item) => (
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
