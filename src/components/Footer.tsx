import Link from "next/link";
import { StaggeredText } from "@/components/StaggeredText";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-24 px-6 md:px-12 mt-32">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          
          <div className="md:col-span-5 flex flex-col justify-between">
            <h2 className="font-heading text-4xl md:text-5xl tracking-tight mb-8">Studio TFA</h2>
            <div className="max-w-md text-background/80 text-lg leading-relaxed mb-12">
              <StaggeredText text="A Christian Creative Studio. Intentional, narrative-driven art and home decor. Let the truth of our products speak louder than trends." />
            </div>
            <div className="text-sm tracking-widest text-background/60 mb-6 uppercase">
              <p>fearlesslypursuing@gmail.com</p>
              <p className="mt-4 text-background/40 hover:text-primary transition-colors cursor-pointer block">+91 9986995622</p>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col space-y-6 text-sm tracking-widest uppercase">
            <h4 className="text-background/50 mb-2 font-bold">Visit Us</h4>
            <p className="text-background/80 leading-relaxed normal-case tracking-normal text-base">
              Kothanur, Bangalore
            </p>
            <p className="text-background/80 leading-relaxed normal-case tracking-normal text-base mt-2">
              Mon-Fri 9 am - 5 pm<br />
              Saturday 10 am - 5 pm<br />
              Sunday closed!
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col">
            <h4 className="text-background/50 mb-8 text-sm tracking-widest uppercase font-bold">The Newsletter</h4>
            <p className="text-background/80 mb-6 leading-relaxed">Join our quiet corner of the internet for occasional letters on inner healing and new collections.</p>
            <form className="flex border-b border-background/20 pb-2 mt-4">
              <input 
                type="email" 
                placeholder="Email address"
                className="bg-transparent border-none outline-none w-full text-background placeholder:text-background/40"
              />
              <button type="submit" className="text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors">
                Subscribe
              </button>
            </form>
          </div>

        </div>
        
        <div className="mt-24 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center text-xs text-background/40 tracking-widest uppercase">
          <p>&copy; {new Date().getFullYear()} Studio TFA. All rights reserved.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <Link href="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-background transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
