import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-sand">
      <main className="theme-surface bg-white p-8 max-w-xl text-left flex flex-col gap-6 border border-border/40">
        <h1 className="text-3xl font-display font-bold text-ink-indigo">Privacy Policy</h1>
        <span className="text-xs font-bold text-clay-rose uppercase font-mono tracking-wider">
          [PLACEHOLDER — NEEDS LEGAL REVIEW]
        </span>
        <p className="text-sm text-deep-charcoal leading-relaxed">
          This document describes how we process user data for Travel Style profiling and itinerary generation. We securely capture explicitly submitted questionnaires, consent flags, and optional implicit event signals.
        </p>
        <p className="text-xs text-dusk-teal">
          Last revised: June 2026.
        </p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </main>
    </div>
  );
}
