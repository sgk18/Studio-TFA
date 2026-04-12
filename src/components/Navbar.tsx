"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import PillNav from "./PillNav";
import StaggeredMenu from "./StaggeredMenu";
import { CartButton } from "./CartButton";

const navItems = [
  { label: "Collections", href: "/collections" },
  { label: "Books", href: "/collections/books" },
  { label: "Journals", href: "/collections/journals" },
  { label: "Artists Corner", href: "/artists-corner" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

const authItems = [
  { label: "Sign In", href: "/login" },
  { label: "Sign Up", href: "/register" },
];

export function Navbar({ isWholesale = false }: { isWholesale?: boolean }) {
  const pathname = usePathname();
  const activeHref =
    navItems.find((item) => pathname === item.href)?.href ??
    navItems
      .filter((item) => pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const isLoginPath    = pathname.startsWith("/login");
  const isRegisterPath = pathname.startsWith("/register");

  const staggeredItems = [...navItems, ...authItems].map((item) => ({
    label: item.label,
    link:  item.href,
  }));

  return (
    <>
      {/* Desktop nav */}
      <header
        className="sticky top-0 z-40 hidden md:block"
        style={{
          background: "rgba(253,248,244,0.84)",
          borderBottom: "1px solid rgba(139,38,62,0.08)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          backdropFilter: "blur(28px) saturate(160%)",
        }}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
          {/* Logo + pill nav */}
          <div className="min-w-0 flex-1">
            <PillNav
              logoText="Studio TFA"
              items={navItems}
              activeHref={activeHref}
              baseColor="var(--foreground)"
              pillColor="var(--card)"
              pillTextColor="var(--foreground)"
              hoveredPillTextColor="var(--foreground)"
              initialLoadAnimation={false}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Sign In — ghost */}
            <Link
              href="/login"
              className={[
                "inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-250",
                isLoginPath
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/50 text-foreground/72 hover:border-primary/40 hover:text-primary",
              ].join(" ")}
            >
              Sign In
            </Link>

            {/* Sign Up — filled */}
            <Link
              href="/register"
              className={[
                "inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-250",
                isRegisterPath
                  ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/20"
                  : "border-primary bg-primary text-primary-foreground hover:bg-rose-400 hover:shadow-[0_6px_20px_rgba(209,116,132,0.30)]",
              ].join(" ")}
            >
              Sign Up
            </Link>

            <GlobalCommandPalette isWholesale={isWholesale} />

            <CartButton className="rounded-full border border-border/50 bg-card/70 px-3 py-2 text-foreground backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(139,38,62,0.12)]" />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden">
        <StaggeredMenu
          isFixed
          logoText="Studio TFA"
          items={staggeredItems}
          displaySocials={false}
          displayItemNumbering={false}
          rightSlot={
            <>
              <GlobalCommandPalette isWholesale={isWholesale} />
              <CartButton className="rounded-full border border-border/50 bg-card/70 px-3 py-2 text-foreground backdrop-blur-lg" />
            </>
          }
        />
        <div className="h-[72px]" aria-hidden="true" />
      </div>
    </>
  );
}
