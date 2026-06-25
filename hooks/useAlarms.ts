import type { Alarm } from "@/types";

export function useAlarms() {
  return {
    alarms: [] as Alarm[],
  };
}
