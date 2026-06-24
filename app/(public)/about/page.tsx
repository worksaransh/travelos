import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-sand">
      <main className="theme-surface bg-white p-8 max-w-xl text-center flex flex-col gap-6 border border-border/40">
        <h1 className="text-4xl font-display font-bold text-ink-indigo">About Journey OS</h1>
        <p className="text-dusk-teal text-sm leading-relaxed">
          We are a team of travel enthusiasts and software designers who believe that travel should be bespoke, not industrialized. Journey OS is an open-source platform that enables hyper-personalized travel orchestration.
        </p>
        <p className="text-xs text-deep-charcoal/60">
          Built with TypeScript, Next.js, and Supabase client-side abstractions.
        </p>
        <Link href="/">
          <Button variant="outline" className="border-ink-indigo text-ink-indigo">Back to Home</Button>
        </Link>
      </main>
    </div>
  );
}
