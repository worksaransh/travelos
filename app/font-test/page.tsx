export default function FontTest() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sand p-8">
      <h1 className="font-display text-4xl text-ink-indigo">
        Fraunces — display face, A5 check
      </h1>
      <p className="font-body text-base text-deep-charcoal">
        Inter — body face. The quick brown fox jumps over the lazy dog.
      </p>
      <p className="font-mono text-sm text-deep-charcoal">
        IBM Plex Mono — 0123456789 — ₹50,000 — 87/100
      </p>
    </main>
  );
}
