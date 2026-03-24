import { ScrollReveal } from "@/components/ScrollReveal";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About | Studio TFA",
  description: "Learn about Studio TFA — a Christian creative studio in Kothanur, Bangalore creating intentional art and lifestyle products."
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-background">
      <div className="container mx-auto max-w-4xl">

        {/* ── Header ──────────────────────────────── */}
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-4">Our Story</p>
          <h1 className="font-heading text-6xl md:text-8xl tracking-tight mb-16 leading-none">About<br />Studio TFA</h1>
        </ScrollReveal>

        {/* ── Vision & Mission ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <ScrollReveal direction="up">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Vision</p>
              <p className="font-heading text-2xl leading-relaxed">
                "To create elegant, boldly minimalist, Christ-centred art and lifestyle products that nurture identity, spark conversations, and infuse homes with beauty and purpose."
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.15}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Mission</p>
              <p className="text-lg leading-relaxed text-foreground/80">
                To serve creatives through powerful, intentional designs and meaningful products — rooted in faith, crafted with excellence, and delivered with love.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Brand Statement ──────────────────────── */}
        <ScrollReveal>
          <div className="border-t border-foreground/10 pt-16 mb-24">
            <p className="font-heading text-3xl md:text-5xl leading-snug text-center max-w-3xl mx-auto">
              "We believe every object in your home has the potential to tell a story of grace."
            </p>
          </div>
        </ScrollReveal>

        {/* ── What We Make ─────────────────────────── */}
        <ScrollReveal>
          <div className="mb-24">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">What We Make</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Books", "Journals", "Apparels", "Home Decor", "Gift Hampers", "Custom Orders"].map((cat) => (
                <Link
                  key={cat}
                  href={`/c/${cat.toLowerCase().replace(/ /g, '-')}`}
                  className="border border-foreground/10 px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300 text-center"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Contact Block ────────────────────────── */}
        <ScrollReveal>
          <div className="bg-foreground text-background p-12 rounded-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/50 mb-6">Get In Touch</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-bold uppercase tracking-widest mb-2 text-background/50 text-xs">Location</p>
                <p className="text-background/80">Kothanur, Bangalore</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest mb-2 text-background/50 text-xs">Hours</p>
                <p className="text-background/80">Mon–Fri 9am–5pm<br />Sat 10am–5pm<br />Sunday Closed</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest mb-2 text-background/50 text-xs">Contact</p>
                <a href="mailto:fearlesslypursuing@gmail.com" className="text-background/80 hover:text-background transition-colors block">fearlesslypursuing@gmail.com</a>
                <a href="https://wa.me/919986995622" className="text-background/80 hover:text-background transition-colors block mt-1">+91 9986995622</a>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
