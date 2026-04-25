import { type ReactNode } from "react";
import Link from "next/link";

import { requireAdminAccess } from "@/lib/security/adminRole";
import { signOut } from "@/app/auth/actions";

export const dynamic = "force-dynamic"; // Admin is always real-time, never cached

const adminNavItems = [
  { href: "/admin", label: "Dashboard", roles: ["admin", "staff", "wholesale"] },
  { href: "/admin/products", label: "Products", roles: ["admin", "staff"] },
  { href: "/admin/orders", label: "Orders", roles: ["admin", "staff"] },
  { href: "/admin/reviews", label: "Reviews", roles: ["admin", "staff"] },
  { href: "/admin/discounts", label: "Discounts", roles: ["admin", "staff", "wholesale"] },
  { href: "/admin/newsletters", label: "Newsletters", roles: ["admin", "staff"] },
  { href: "/admin/custom-orders", label: "Custom Orders", roles: ["admin", "staff"] },
  { href: "/admin/returns", label: "Returns", roles: ["admin", "staff"] },
  { href: "/admin/users", label: "Users", roles: ["admin"] },
  { href: "/admin/access", label: "Access", roles: ["admin"] },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile } = await requireAdminAccess({ from: "/admin" });

  const filteredNavItems = adminNavItems.filter((item) =>
    item.roles.includes(profile.role)
  );

  return (
    <div className="min-h-screen px-6 pb-14 pt-26 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="glass-shell rounded-[1.4rem] px-5 py-4 md:px-7 md:py-5 print:hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Operations Dashboard
              </p>
              <h1 className="mt-2 font-heading text-3xl tracking-tight md:text-4xl">
                Studio TFA Admin
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                  Access Level:
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                  {profile.role}
                </span>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-border/70 bg-card/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/72 transition-colors hover:border-primary hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-border/70 bg-card/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/72 transition-colors hover:border-primary hover:text-primary"
                >
                  Logout
                </button>
              </form>
            </nav>
          </div>
        </header>

        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
