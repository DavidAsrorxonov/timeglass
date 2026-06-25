export function usePomodoro() {
  return {
    mode: "focus" as const,
    remainingSeconds: 25 * 60,
    isRunning: false,
  };
}
