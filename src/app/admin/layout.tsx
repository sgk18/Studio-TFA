import { type ReactNode } from "react";
import Link from "next/link";

import { requireAdminAccess } from "@/lib/security/adminRole";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminAccess({ from: "/admin" });

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
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-border/70 bg-card/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/72 transition-colors hover:border-primary hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
