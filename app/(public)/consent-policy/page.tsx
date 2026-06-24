import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConsentPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-sand">
      <main className="theme-surface bg-white p-8 max-w-xl text-left flex flex-col gap-6 border border-border/40">
        <h1 className="text-3xl font-display font-bold text-ink-indigo">Consent & Cookie Policy</h1>
        <span className="text-xs font-bold text-clay-rose uppercase font-mono tracking-wider">
          [PLACEHOLDER — NEEDS LEGAL REVIEW]
        </span>
        <p className="text-sm text-deep-charcoal leading-relaxed">
          We use functional cookies to track anonymous questionnaire sessions and local states. At Tier 5, we require explicit DPDP (Data Protection) consent before linking your anonymous session to a WhatsApp number (Gate 1) or full contact details (Gate 2).
        </p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </main>
    </div>
  );
}
