import type { ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
};

export function GlassPanel({
  children,
  className = "",
  hover = false,
  glow = false,
}: GlassPanelProps) {
  void glow;

  return (
    <div
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm transition ${
        hover ? "hover:-translate-y-px" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
