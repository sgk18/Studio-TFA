"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartDrawer } from "@/components/CartDrawer";
import PillNav from "./PillNav";
import StaggeredMenu from "./StaggeredMenu";
import { CartButton } from "./CartButton";

const navItems = [
  { label: 'Collections', href: '/collections', link: '/collections', ariaLabel: 'View all collections' },
  { label: 'Books',        href: '/c/books',     link: '/c/books',     ariaLabel: 'Browse books' },
  { label: 'Journals',     href: '/c/journals',  link: '/c/journals',  ariaLabel: 'Browse journals' },
  { label: 'About',        href: '/about',       link: '/about',       ariaLabel: 'About Studio TFA' },
];

const socialItems = [
  { label: 'Instagram', link: 'https://instagram.com/studiotfa' },
  { label: 'Email',     link: 'mailto:fearlesslypursuing@gmail.com' },
  { label: 'WhatsApp',  link: 'https://wa.me/919986995622' },
];

export function Navbar() {
  const pathname = usePathname();
  
  // Hide the public navbar on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      {/* Desktop Navbar - PillNav */}
      <nav className="hidden md:flex fixed w-full z-50 top-0 px-4 sm:px-6 py-4 pointer-events-none">
        <div className="container mx-auto flex items-center justify-between pointer-events-auto h-14 rounded-2xl border border-white/45 bg-white/34 backdrop-blur-2xl px-4 shadow-[0_14px_36px_rgba(15,23,42,0.18)]">
          
          <div className="flex-1 flex items-center">
            <PillNav
              logoText="Studio TFA"
              items={navItems}
              baseColor="rgba(17,24,39,0.72)"
              pillColor="rgba(255,255,255,0.82)"
              hoveredPillTextColor="white"
              pillTextColor="#111827"
              initialLoadAnimation={true}
            />
          </div>

          <div className="flex items-center gap-6 z-50">
            <Link href="/login" className="text-xs tracking-[0.2em] font-bold uppercase text-foreground/85 hover:text-foreground transition-colors">
              Account
            </Link>
            <CartButton />
          </div>
        </div>
      </nav>

      {/* Mobile Navbar - StaggeredMenu */}
      <div className="flex md:hidden">
        <StaggeredMenu
          logoText="Studio TFA"
          items={navItems}
          socialItems={socialItems}
          isFixed={true}
          rightSlot={
            <div className="flex items-center gap-5 sm:gap-6">
              <Link href="/login" className="text-xs tracking-[0.2em] font-bold uppercase text-foreground/85 hover:text-foreground transition-colors">
                Account
              </Link>
              <CartButton />
            </div>
          }
        />
      </div>

      <CartDrawer />
    </>
  );
}
