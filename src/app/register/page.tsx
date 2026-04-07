import type { Metadata } from "next";
import Link from "next/link";
import { signUp, signUpWithGoogle } from "@/app/auth/actions";
import { safeDecodeQueryParam } from "@/lib/pageValidation";

export const metadata: Metadata = {
  title: "Create Account | Studio TFA",
  description: "Create a Studio TFA account to save your cart and track your orders.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const errorMessage = safeDecodeQueryParam(error);

  if (success === "check_email") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md text-center glass-panel rounded-[1.75rem] border border-border/70 p-10 shadow-[0_25px_80px_rgba(18,26,45,0.2)]">
          <Link href="/" className="font-heading text-3xl tracking-tight text-foreground">Studio TFA</Link>
          <h1 className="font-heading text-5xl mt-10 mb-6 tracking-tight">Check your inbox.</h1>
          <p className="text-foreground/60 leading-relaxed mb-10">
            We've sent a confirmation link to your email address. Click it to activate your account.
          </p>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-primary transition-colors">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
      <div className="w-full max-w-md glass-panel rounded-[1.75rem] border border-border/70 p-8 sm:p-10 shadow-[0_25px_80px_rgba(18,26,45,0.2)]">
        <div className="mb-16 text-center">
          <Link href="/" className="font-heading text-3xl tracking-tight text-foreground">Studio TFA</Link>
          <h1 className="font-heading text-5xl mt-8 mb-4 tracking-tight">Join us.</h1>
          <p className="text-foreground/60 leading-relaxed">
            Create an account for early access, order tracking, and a 10% welcome gift.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-200/70 text-red-700 text-sm rounded-xl backdrop-blur-md">
            {errorMessage}
          </div>
        )}

        <div className="glass-subpanel rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Multiple Account Options
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a href="#google-signup" className="action-pill-link justify-center">
              Sign Up with Google
            </a>
            <a href="#email-signup" className="action-pill-link justify-center">
              Sign Up with Email
            </a>
            <Link href="/login" className="action-pill-link justify-center">
              Already Have Account
            </Link>
            <Link href="/collections" className="action-pill-link justify-center">
              Continue As Guest
            </Link>
          </div>
        </div>

        <form id="google-signup" action={signUpWithGoogle} className="space-y-3">
          <input type="hidden" name="next" value="/" />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-3 border border-border/80 bg-card/70 hover:bg-card/90 backdrop-blur-xl text-foreground py-3.5 text-xs tracking-widest uppercase font-bold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.61 20.08H42V20H24v8h11.3C33.65 32.66 29.28 36 24 36c-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.06 6.05 29.27 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92z" />
              <path fill="#FF3D00" d="M6.31 14.69l6.57 4.82C14.66 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.06 6.05 29.27 4 24 4c-7.68 0-14.33 4.34-17.69 10.69z" />
              <path fill="#4CAF50" d="M24 44c5.17 0 9.86-1.98 13.41-5.19l-6.19-5.24C29.14 35.09 26.68 36 24 36c-5.26 0-9.62-3.31-11.28-7.92l-6.52 5.02C9.52 39.56 16.21 44 24 44z" />
              <path fill="#1976D2" d="M43.61 20.08H42V20H24v8h11.3a12.03 12.03 0 01-4.08 5.57h.01l6.19 5.24C36.97 39.14 44 34 44 24c0-1.34-.14-2.65-.39-3.92z" />
            </svg>
            Sign up with Google
          </button>
        </form>

        <div className="relative my-6">
          <div className="h-px bg-border/70" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 bg-card/85 text-xs font-bold tracking-[0.2em] text-muted-foreground">
            OR
          </span>
        </div>

        <form id="email-signup" action={signUp} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase font-bold text-muted-foreground mb-3">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              autoComplete="name"
              className="w-full border border-border/70 bg-card/65 backdrop-blur-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase font-bold text-muted-foreground mb-3">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full border border-border/70 bg-card/65 backdrop-blur-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase font-bold text-muted-foreground mb-3">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="w-full border border-border/70 bg-card/65 backdrop-blur-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            className="w-full border border-primary/80 bg-primary text-primary-foreground py-4 text-xs tracking-widest uppercase font-bold hover:bg-primary/90 transition-colors duration-300 mt-2 backdrop-blur-lg"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          <div className="h-px bg-border" />
          <Link
            href="/collections"
            className="block w-full border border-border/70 bg-card/55 py-4 text-xs tracking-widest uppercase font-bold text-foreground/80 hover:border-primary/50 hover:bg-card/80 hover:text-foreground transition-colors backdrop-blur-lg"
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
