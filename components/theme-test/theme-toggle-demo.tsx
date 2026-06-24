"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggleDemo() {
  const [theme, setTheme] = useState<"consumer" | "internal">("consumer");

  return (
    <div data-theme={theme} className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sand p-8">
      <Button onClick={() => setTheme(theme === "consumer" ? "internal" : "consumer")}>
        Currently: {theme} — click to toggle
      </Button>

      <div className="theme-surface w-80 border border-ink-indigo/15 bg-white p-6">
        <p className="font-medium text-deep-charcoal">Sample surface card</p>
        <p className="mt-1 text-sm text-deep-charcoal/70">
          radius and shadow should visibly change between themes; colors stay identical.
        </p>
      </div>
    </div>
  );
}
