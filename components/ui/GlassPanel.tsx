"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.div
      className={`glass-panel ${className}`}
      initial={glow ? { opacity: 0, scale: 0.98 } : false}
      animate={glow ? { opacity: 1, scale: 1 } : undefined}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
