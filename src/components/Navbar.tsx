"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import PillNav from "./PillNav";
import StaggeredMenu from "./StaggeredMenu";
import { CartButton } from "./CartButton";
import { resolvePrimaryNavHref } from "@/lib/pageValidation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();
  const activeHref = resolvePrimaryNavHref(pathname);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAccessStatus = async () => {
      try {
        const response = await fetch("/api/admin/access-status", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (isMounted) {
            setHasAdminAccess(false);
          }
          return;
        }

        const payload = (await response.json()) as { allowed?: boolean };
        if (isMounted) {
          setHasAdminAccess(Boolean(payload.allowed));
        }
      } catch {
        if (isMounted) {
          setHasAdminAccess(false);
        }
      }
    };

    fetchAccessStatus();

    return () => {
      isMounted = false;
    };
  }, []);
  
  // Hide the public navbar on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      {/* Desktop Navbar - PillNav */}
      <nav className="hidden md:flex fixed w-full z-50 top-0 px-4 sm:px-6 py-4 pointer-events-none">
        <div className="container mx-auto flex items-center justify-between pointer-events-auto h-14 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-2xl px-4 shadow-[0_14px_36px_rgba(15,23,42,0.18)]">
          
          <div className="flex-1 flex items-center">
            <PillNav
              logoText="Studio TFA"
              items={navItems}
              activeHref={activeHref}
              baseColor="rgba(17,24,39,0.72)"
              pillColor="rgba(255,255,255,0.82)"
              hoveredPillTextColor="white"
              pillTextColor="#111827"
              initialLoadAnimation={true}
            />
          </div>

          <div className="flex items-center gap-6 z-50">
            {hasAdminAccess && (
              <Link
                href="/admin"
                className="action-pill-link"
              >
                Admin
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="action-pill-link gap-1.5">
                Account
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Sign-In Options</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/login") }>
                  Sign In
                  <DropdownMenuShortcut>Email / Google</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/register") }>
                  Create Account
                  <DropdownMenuShortcut>New User</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Store Access</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/collections") }>
                  Continue As Guest
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => { window.location.href = "mailto:fearlesslypursuing@gmail.com"; }}>
                  Contact Support
                </DropdownMenuItem>
                {hasAdminAccess && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin") }>
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
              {hasAdminAccess && (
                <Link
                  href="/admin"
                  className="action-pill-link px-3 py-1.5 text-xs"
                >
                  Admin
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className="action-pill-link px-3 py-1.5 text-xs gap-1.5">
                  Account
                  <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>Sign-In Options</DropdownMenuLabel>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/login") }>
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/register") }>
                    Create Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/collections") }>
                    Continue As Guest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CartButton />
            </div>
          }
        />
      </div>

      <CartDrawer />
    </>
  );
}
