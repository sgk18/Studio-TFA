import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account | Studio TFA",
  description: "Create a Studio TFA account to save your cart and track your orders.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="mb-16 text-center">
          <Link href="/" className="font-heading text-3xl tracking-tight text-foreground">Studio TFA</Link>
          <h1 className="font-heading text-5xl mt-8 mb-4 tracking-tight">Join us.</h1>
          <p className="text-foreground/60 leading-relaxed">
            Create an account for early access, order tracking, and a 10% welcome gift.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase font-bold text-foreground/50 mb-3">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              autoComplete="name"
              className="w-full border border-border bg-transparent px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-colors"
              placeholder="Your name"
            />
          </div>
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
              autoComplete="new-password"
              minLength={8}
              className="w-full border border-border bg-transparent px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-foreground text-background py-4 text-xs tracking-widest uppercase font-bold hover:bg-primary transition-colors duration-300 mt-2"
          >
            Create Account
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
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
