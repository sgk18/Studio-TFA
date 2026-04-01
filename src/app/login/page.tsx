import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Sign In | Studio TFA",
  description: "Sign in to your Studio TFA account to track orders and save favourites.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectedFrom?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="mb-16 text-center">
          <Link href="/" className="font-heading text-3xl tracking-tight text-foreground">Studio TFA</Link>
          <h1 className="font-heading text-5xl mt-8 mb-4 tracking-tight">Welcome back.</h1>
          <p className="text-foreground/60 leading-relaxed">Sign in to your account to continue.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={signIn} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase font-bold text-foreground/50 mb-3">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full border border-border bg-transparent px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase font-bold text-foreground/50 mb-3">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border border-border bg-transparent px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-foreground text-background py-4 text-xs tracking-widest uppercase font-bold hover:bg-primary transition-colors duration-300 mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          <div className="h-px bg-border" />
          <Link
            href="/collections"
            className="block w-full border border-border py-4 text-xs tracking-widest uppercase font-bold text-foreground/70 hover:border-foreground hover:text-foreground transition-colors"
          >
            Continue as Guest →
          </Link>
          <p className="text-sm text-foreground/50">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
