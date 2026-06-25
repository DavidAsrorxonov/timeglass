"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`glass-panel ${className}`}
      initial={glow && !reduceMotion ? { opacity: 0, scale: 0.98 } : false}
      animate={glow && !reduceMotion ? { opacity: 1, scale: 1 } : undefined}
      whileHover={hover && !reduceMotion ? { y: -2 } : undefined}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
