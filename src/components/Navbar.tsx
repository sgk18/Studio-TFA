"use client";

import Link from "next/link";
import { CartDrawer } from "@/components/CartDrawer";
import PillNav from "./PillNav";
import StaggeredMenu from "./StaggeredMenu";
import { CartButton } from "./CartButton";

const navItems = [
  { label: 'Collections', href: '/collections', link: '/collections', ariaLabel: 'View all collections' },
  { label: 'Books', href: '/c/books', link: '/c/books', ariaLabel: 'View books' },
  { label: 'Journals', href: '/c/journals', link: '/c/journals', ariaLabel: 'View journals' },
  { label: 'About', href: '/about', link: '/about', ariaLabel: 'Learn about us' }
];

const socialItems = [
  { label: 'Instagram', link: 'https://instagram.com/studiotfa' },
  { label: 'Email', link: 'mailto:fearlesslypursuing@gmail.com' },
  { label: 'WhatsApp', link: 'https://wa.me/919986995622' }
];

export function Navbar() {
  return (
    <>
      {/* Desktop Navbar - Uses PillNav */}
      <nav className="hidden md:flex fixed w-full z-50 top-0 px-6 py-4 pointer-events-none mix-blend-difference text-white">
        <div className="container mx-auto flex items-center justify-between pointer-events-auto h-12">
          
          <div className="flex-1 flex items-center">
            <PillNav
              logoText="Studio TFA"
              items={navItems}
              baseColor="black"
              pillColor="white"
              hoveredPillTextColor="white"
              pillTextColor="black"
              initialLoadAnimation={true}
            />
          </div>

          <div className="flex items-center gap-6 z-50">
            <Link href="/login" className="text-xs tracking-[0.2em] font-bold uppercase hover:opacity-70 transition-opacity">
              Account
            </Link>
            <CartButton />
          </div>
        </div>
      </nav>

      {/* Mobile Navbar - Uses StaggeredMenu */}
      <div className="flex md:hidden">
        <StaggeredMenu
          logoText="Studio TFA"
          items={navItems}
          socialItems={socialItems}
          isFixed={true}
          rightSlot={
            <div className="flex items-center gap-5 sm:gap-6">
              <Link href="/login" className="text-xs tracking-[0.2em] font-bold uppercase hover:opacity-70 transition-opacity">
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
