export function useNotifications() {
  return {
    permission: "default" as NotificationPermission,
    requestPermission: async () => false,
  };
}
