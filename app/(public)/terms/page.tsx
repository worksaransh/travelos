import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-sand">
      <main className="theme-surface bg-white p-8 max-w-xl text-left flex flex-col gap-6 border border-border/40">
        <h1 className="text-3xl font-display font-bold text-ink-indigo">Terms of Service</h1>
        <span className="text-xs font-bold text-clay-rose uppercase font-mono tracking-wider">
          [PLACEHOLDER — NEEDS LEGAL REVIEW]
        </span>
        <p className="text-sm text-deep-charcoal leading-relaxed">
          By accessing this site or filling out the Travel Style questionnaire, you agree that your inputs will be processed by our scoring engine. Agent overrides, pricing bands, and booking actions are governed by specific carrier regulations.
        </p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </main>
    </div>
  );
}
