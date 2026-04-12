"use client";

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

export function Navbar({ isWholesale = false }: { isWholesale?: boolean }) {
  const pathname = usePathname();
  const activeHref =
    navItems.find((item) => pathname === item.href)?.href ??
    navItems
      .filter((item) => pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const staggeredItems = navItems.map((item) => ({
    label: item.label,
    link: item.href,
  }));

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-border/60 bg-background/78 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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

          <div className="flex items-center gap-2.5">
            <GlobalCommandPalette isWholesale={isWholesale} />
            <CartButton className="rounded-full border border-border/60 bg-card/65 px-3 py-2 text-foreground shadow-[0_12px_28px_rgba(139,38,62,0.08)] backdrop-blur-lg transition-transform duration-300 hover:-translate-y-0.5" />
          </div>
        </div>
      </header>

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
              <CartButton className="rounded-full border border-border/60 bg-card/65 px-3 py-2 text-foreground shadow-[0_10px_24px_rgba(139,38,62,0.08)] backdrop-blur-lg" />
            </>
          }
        />
        <div className="h-20" aria-hidden="true" />
      </div>
    </>
  );
}
