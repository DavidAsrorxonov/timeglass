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
  const radius = (size - strokeWidth * 3) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safeValue);
  const color = success
    ? "var(--chart-1)"
    : danger
      ? "var(--destructive)"
      : "var(--primary)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`overflow-visible ${className}`}
      role="img"
      aria-label={`${Math.round(safeValue * 100)}% remaining`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        style={{
          rotate: "-90deg",
          transformOrigin: "50% 50%",
          transition: "stroke-dashoffset 0.25s linear",
        }}
      />
    </svg>
  );
}
