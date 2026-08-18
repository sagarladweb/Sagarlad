"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-32 text-center">
      <p className="text-6xl">Something went wrong</p>
      <h1 className="mt-6 font-display text-3xl font-bold">
        We hit an unexpected snag
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        An error occurred while rendering this page. Please try again &mdash; most of
        the time it&apos;s a temporary hiccup.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
