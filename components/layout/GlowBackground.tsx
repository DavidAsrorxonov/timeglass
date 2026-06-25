export function GlowBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-px w-[min(44rem,80vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-violet-400/20 via-sky-300/20 to-emerald-300/20" />
    </div>
  );
}
