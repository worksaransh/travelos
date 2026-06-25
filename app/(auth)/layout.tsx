import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="consumer" className="min-h-screen bg-sand text-deep-charcoal flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle brand gradients */}
      <div className="absolute top-0 left-0 -z-10 w-96 h-96 rounded-full bg-marigold/10 filter blur-3xl opacity-60 transform -translate-x-12 -translate-y-12" />
      <div className="absolute bottom-0 right-0 -z-10 w-96 h-96 rounded-full bg-clay-rose/10 filter blur-3xl opacity-60 transform translate-x-12 translate-y-12" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-display font-bold tracking-tight text-ink-indigo">
          Journey OS
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 border border-border/40 shadow-xl rounded-3xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
