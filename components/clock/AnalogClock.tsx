"use client";

import { useMemo } from "react";
import { useClock } from "@/hooks/useClock";

interface AnalogClockProps {
  timezone?: string;
  size?: number;
  compact?: boolean;
}

export function AnalogClock({
  timezone,
  size = 260,
  compact = false,
}: AnalogClockProps) {
  const { hours, minutes, seconds, milliseconds } = useClock(timezone);

  const hourRotation = (hours % 12) * 30 + minutes * 0.5;
  const minuteRotation = minutes * 6;
  const secondRotation = (seconds + milliseconds / 1000) * 6;

  const ticks = useMemo(() => {
    return Array.from({ length: 60 }, (_, index) => {
      const isMajor = index % 5 === 0;

      return {
        index,
        angle: index * 6,
        length: isMajor ? 12 : 6,
        opacity: isMajor ? 0.7 : 0.28,
        strokeWidth: isMajor ? 2 : 1,
      };
    });
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      role="img"
      aria-label="Analog clock"
      className={compact ? "drop-shadow-lg" : "drop-shadow-2xl"}
    >
      <defs>
        <filter id={`second-hand-glow-${compact ? "compact" : "main"}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="130"
        cy="130"
        r="118"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />

      {ticks.map((tick) => (
        <line
          key={tick.index}
          x1="130"
          y1="22"
          x2="130"
          y2={22 + tick.length}
          stroke="rgba(241,245,249,0.85)"
          strokeWidth={tick.strokeWidth}
          opacity={tick.opacity}
          transform={`rotate(${tick.angle} 130 130)`}
          strokeLinecap="round"
        />
      ))}

      <g transform={`rotate(${hourRotation} 130 130)`}>
        <line
          x1="130"
          y1="130"
          x2="130"
          y2="80"
          stroke="rgba(241,245,249,0.95)"
          strokeWidth={compact ? 8 : 9}
          strokeLinecap="round"
        />
      </g>

      <g transform={`rotate(${minuteRotation} 130 130)`}>
        <line
          x1="130"
          y1="130"
          x2="130"
          y2="48"
          stroke="rgba(241,245,249,0.82)"
          strokeWidth={compact ? 5 : 6}
          strokeLinecap="round"
        />
      </g>

      <g transform={`rotate(${secondRotation} 130 130)`}>
        <line
          x1="130"
          y1="146"
          x2="130"
          y2="34"
          stroke="var(--accent-primary)"
          strokeWidth={compact ? 2.5 : 3}
          strokeLinecap="round"
          filter={`url(#second-hand-glow-${compact ? "compact" : "main"})`}
        />
        <circle
          cx="130"
          cy="34"
          r={compact ? 3 : 4}
          fill="var(--accent-glow)"
        />
      </g>

      <circle cx="130" cy="130" r="7" fill="var(--accent-primary)" />
      <circle cx="130" cy="130" r="3" fill="white" opacity="0.9" />
    </svg>
  );
}
