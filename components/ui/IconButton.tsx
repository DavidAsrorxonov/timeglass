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
      className={`inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-slate-100 transition hover:bg-white/12 ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
