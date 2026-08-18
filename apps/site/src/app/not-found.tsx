import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* soft brand-light glow, kept subtle per brand rules */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-light/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="font-display text-[7rem] leading-none font-bold tracking-tighter text-foreground sm:text-[9rem]">
          <span aria-hidden="true">4</span>
          <span className="text-brand">0</span>
          <span aria-hidden="true">4</span>
        </p>
        <p className="mt-2 font-signature text-3xl text-brand">
          You&apos;re off the map
        </p>
        <h1 className="sr-only">Page not found</h1>
        <p className="mx-auto mt-4 max-w-sm text-muted-foreground leading-relaxed">
          That page isn&apos;t here. Head back home — there&apos;s plenty worth
          your attention.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Back to home <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
