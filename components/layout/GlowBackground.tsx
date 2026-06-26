export function GlowBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-background"
      aria-hidden="true"
    />
  );
}
