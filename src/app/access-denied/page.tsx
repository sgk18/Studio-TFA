import type { Metadata } from "next";
import Link from "next/link";

import { safeDecodeQueryParam } from "@/lib/pageValidation";

export const metadata: Metadata = {
  title: "Access Denied | Studio TFA",
  description: "Your current network is not allowed to access this admin area.",
};

function normalizeFromPath(value: string | null): string {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;
  const errorMessage =
    safeDecodeQueryParam(error) ??
    "Your current IP address is not allowed to access this admin route.";
  const attemptedPath = normalizeFromPath(safeDecodeQueryParam(from));

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="w-full max-w-2xl glass-panel rounded-[1.75rem] border border-border/70 p-10 text-center shadow-[0_25px_80px_rgba(18,26,45,0.2)]">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
          403
        </p>
        <h1 className="font-heading text-5xl md:text-6xl tracking-tight mb-4">Access Denied</h1>
        <p className="text-foreground/70 leading-relaxed mb-4">{errorMessage}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Requested path: <span className="font-mono normal-case tracking-normal">{attemptedPath}</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="action-pill-link"
          >
            Home
          </Link>
          <Link
            href="/collections"
            className="action-pill-link"
          >
            Collections
          </Link>
          <Link
            href="/about"
            className="action-pill-link"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
