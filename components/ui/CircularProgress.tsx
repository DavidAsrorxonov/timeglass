"use client";

import { motion } from "framer-motion";
import { useId } from "react";

type CircularProgressProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  danger?: boolean;
  success?: boolean;
};

export function CircularProgress({
  value,
  size = 280,
  strokeWidth = 12,
  className = "",
  danger = false,
  success = false,
}: CircularProgressProps) {
  const safeValue = Math.min(1, Math.max(0, value));
  const filterId = useId().replaceAll(":", "");
  const radius = (size - strokeWidth * 3) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safeValue);
  const color = success
    ? "var(--accent-success)"
    : danger
      ? "var(--accent-danger)"
      : "var(--accent-primary)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`overflow-visible ${className}`}
      role="img"
      aria-label={`${Math.round(safeValue * 100)}% remaining`}
    >
      <defs>
        <filter
          id={filterId}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={strokeWidth * 0.85}
          />
        </filter>
      </defs>

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={strokeWidth}
      />

      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 0.25, ease: "linear" }}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        strokeOpacity={0.42}
        filter={`url(#${filterId})`}
        style={{
          rotate: -90,
          transformOrigin: "50% 50%",
        }}
      />

      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 0.25, ease: "linear" }}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        style={{
          rotate: -90,
          transformOrigin: "50% 50%",
        }}
      />
    </svg>
  );
}
