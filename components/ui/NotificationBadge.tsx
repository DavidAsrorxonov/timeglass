type NotificationBadgeProps = {
  show?: boolean;
};

export function NotificationBadge({ show = false }: NotificationBadgeProps) {
  if (!show) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-destructive"
    />
  );
}
