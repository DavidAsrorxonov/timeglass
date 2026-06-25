import type { ComponentPropsWithoutRef } from "react";

type GlassPanelProps = ComponentPropsWithoutRef<"section">;

export function GlassPanel({ className = "", ...props }: GlassPanelProps) {
  return <section className={`glass-panel ${className}`} {...props} />;
}
