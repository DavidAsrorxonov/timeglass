import { Flag } from "lucide-react";
import { EmptyState } from "@/components/empty-states/EmptyState";

export function LapEmptyState() {
  return (
    <EmptyState
      icon={<Flag className="size-6" aria-hidden="true" />}
      title="No laps yet"
      description="Start the stopwatch and press Lap to record split times."
      className="mt-6"
    />
  );
}
