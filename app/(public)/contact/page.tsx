import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-sand">
      <main className="theme-surface bg-white p-8 max-w-xl text-center flex flex-col gap-6 border border-border/40">
        <h1 className="text-4xl font-display font-bold text-ink-indigo">Contact Us</h1>
        <p className="text-dusk-teal text-sm leading-relaxed">
          Have questions about our travel matching algorithms or booking queue? Send our agent desk a message, and we'll get back to you within 2 hours.
        </p>
        <form className="flex flex-col gap-3 text-left w-full">
          <label className="text-xs font-semibold text-ink-indigo">Email Address</label>
          <input type="email" placeholder="you@example.com" className="p-2 border border-border rounded" />
          <label className="text-xs font-semibold text-ink-indigo">Message</label>
          <textarea placeholder="Tell us how we can help..." className="p-2 border border-border rounded h-24" />
          <Button type="button" className="bg-clay-rose hover:bg-clay-rose/90 text-white">Send Message</Button>
        </form>
        <Link href="/">
          <Button variant="ghost" className="text-xs text-dusk-teal">Cancel and Return</Button>
        </Link>
      </main>
    </div>
  );
}
