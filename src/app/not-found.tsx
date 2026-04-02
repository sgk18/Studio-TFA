import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="w-full max-w-2xl glass-panel rounded-[1.75rem] border border-white/45 p-10 text-center shadow-[0_25px_80px_rgba(18,26,45,0.2)]">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
          404
        </p>
        <h1 className="font-heading text-5xl md:text-6xl tracking-tight mb-4">Page Not Found</h1>
        <p className="text-foreground/70 leading-relaxed mb-8">
          The page you requested does not exist or the link is no longer valid.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
          >
            Home
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
          >
            Collections
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
