import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="glass-panel w-full max-w-lg p-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          This Timeglass page does not exist.
        </p>

        <Link
          href="/"
          className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-3 font-medium text-foreground shadow-sm transition hover:bg-accent"
        >
          Back to Timeglass
        </Link>
      </div>
    </main>
  );
}
