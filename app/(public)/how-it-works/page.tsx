import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-sand">
      <main className="theme-surface bg-white p-8 max-w-xl text-center flex flex-col gap-6 border border-border/40">
        <h1 className="text-4xl font-display font-bold text-ink-indigo">How It Works</h1>
        <p className="text-dusk-teal text-sm leading-relaxed">
          Journey OS takes the guesswork out of luxury travel. We map your specific tastes across 10 dimensions—like Nature, Relaxation, and Adventure—and execute it with live agents.
        </p>
        <ol className="text-left flex flex-col gap-3 text-sm text-deep-charcoal/80 my-2">
          <li><strong>Step 1:</strong> Take our 4-question constraint quiz.</li>
          <li><strong>Step 2:</strong> Drag the sliders to refine your DNA matching profile.</li>
          <li><strong>Step 3:</strong> Review the dynamically computed destination matches instantly.</li>
          <li><strong>Step 4:</strong> Submit intent to let an agent book and secure custom overrides.</li>
        </ol>
        <Link href="/quiz">
          <Button className="bg-marigold hover:bg-marigold/90 text-white font-semibold">Start the Quiz</Button>
        </Link>
      </main>
    </div>
  );
}
