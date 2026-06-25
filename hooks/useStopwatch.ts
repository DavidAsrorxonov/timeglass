export function useStopwatch() {
  return {
    elapsedMilliseconds: 0,
    isRunning: false,
    laps: [] as number[],
  };
}
