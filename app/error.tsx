"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="glass-panel w-full max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Timeglass had a problem loading this page.
        </p>

        <button
          type="button"
          onClick={() => unstable_retry()}
          className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
