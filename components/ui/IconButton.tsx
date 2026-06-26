import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({
  label,
  icon,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`focus-ring inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition hover:bg-accent ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
