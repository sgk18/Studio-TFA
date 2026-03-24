import Link from "next/link";
import { StaggeredText } from "@/components/StaggeredText";

const shopLinks = [
  { label: "All Collections", href: "/collections" },
  { label: "Books",           href: "/c/books" },
  { label: "Journals",        href: "/c/journals" },
  { label: "Apparels",        href: "/c/apparels" },
  { label: "Home Decor",      href: "/c/home-decor" },
  { label: "Gift Hampers",    href: "/c/gift-hampers" },
  { label: "Custom Orders",   href: "/c/custom-orders" },
];

const studioLinks = [
  { label: "About",    href: "/about" },
  { label: "Account",  href: "/login" },
  { label: "Register", href: "/register" },
];

const connectLinks = [
  { label: "Email Us",  href: "mailto:fearlesslypursuing@gmail.com" },
  { label: "WhatsApp",  href: "https://wa.me/919986995622" },
  { label: "Instagram", href: "https://instagram.com/studiotfa" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-24 px-6 md:px-12 mt-32">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          
          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col">
            <h2 className="font-heading text-4xl md:text-5xl tracking-tight mb-8">Studio TFA</h2>
            <div className="max-w-md text-background/70 text-base leading-relaxed mb-10">
              <StaggeredText text="A Christian Creative Studio. Intentional, narrative-driven art and home decor. Let the truth of our products speak louder than trends." />
            </div>
            <div className="text-sm text-background/50 space-y-1">
              <p>Kothanur, Bangalore</p>
              <p>Mon–Fri 9am–5pm · Sat 10am–5pm</p>
            </div>
          </div>

          {/* Shop Links */}
          <div className="md:col-span-2 flex flex-col space-y-3">
            <h4 className="text-background/40 mb-2 text-xs font-bold uppercase tracking-widest">Shop</h4>
            {shopLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-sm text-background/70 hover:text-background transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Studio Links */}
          <div className="md:col-span-2 flex flex-col space-y-3">
            <h4 className="text-background/40 mb-2 text-xs font-bold uppercase tracking-widest">Studio</h4>
            {studioLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-sm text-background/70 hover:text-background transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Connect + Newsletter */}
          <div className="md:col-span-4 flex flex-col">
            <h4 className="text-background/40 mb-4 text-xs font-bold uppercase tracking-widest">Connect</h4>
            <div className="flex flex-col space-y-2 mb-10">
              {connectLinks.map(l => (
                <a key={l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  className="text-sm text-background/70 hover:text-background transition-colors">
                  {l.label}
                </a>
              ))}
            </div>

            <h4 className="text-background/40 mb-3 text-xs font-bold uppercase tracking-widest">Newsletter</h4>
            <p className="text-background/60 text-sm mb-4 leading-relaxed">Occasional letters on inner healing and new collections.</p>
            <form className="flex border-b border-background/20 pb-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-none outline-none w-full text-background placeholder:text-background/30 text-sm"
              />
              <button type="submit" className="text-xs font-bold tracking-widest uppercase hover:text-primary transition-colors ml-3 shrink-0">
                Subscribe
              </button>
            </form>
          </div>

        </div>
        
        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center text-xs text-background/30 tracking-widest uppercase gap-4">
          <p>&copy; {new Date().getFullYear()} Studio TFA. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-background/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-background/60 transition-colors">Terms</Link>
            <Link href="/admin" className="hover:text-background/60 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
