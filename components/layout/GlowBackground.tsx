"use client";

import { motion, useReducedMotion } from "framer-motion";

export function GlowBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-[-12%] opacity-80"
        style={{
          background:
            "linear-gradient(125deg, rgba(124,107,255,0.22), transparent 28%, rgba(20,184,166,0.14) 46%, transparent 64%, rgba(245,158,11,0.12)), linear-gradient(215deg, transparent 18%, rgba(56,189,248,0.12), transparent 58%)",
        }}
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["-2%", "2%", "-2%"],
                y: ["-1%", "1.5%", "-1%"],
                scale: [1, 1.04, 1],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,20,0.28)_55%,rgba(10,10,20,0.88)_100%)]" />
    </div>
  );
}
