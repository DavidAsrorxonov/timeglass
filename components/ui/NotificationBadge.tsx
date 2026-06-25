type NotificationBadgeProps = {
  count: number;
};

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-400 px-1.5 py-0.5 text-xs font-semibold leading-none text-slate-950">
      {count}
    </span>
  );
}
