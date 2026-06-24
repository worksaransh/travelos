import localFont from "next/font/local";

// Display face — Fraunces, variable. Used sparingly, per Phase 10 §10.4.
export const fraunces = localFont({
  src: "../public/fonts/Fraunces.ttf",
  variable: "--font-display",
  display: "swap",
});

// Body face — Inter, variable.
export const inter = localFont({
  src: "../public/fonts/Inter.ttf",
  variable: "--font-body",
  display: "swap",
});

// Data/utility face — IBM Plex Mono, two static weights.
export const plexMono = localFont({
  src: [
    { path: "../public/fonts/IBMPlexMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/IBMPlexMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});
