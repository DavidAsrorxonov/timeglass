import { AlarmClock } from "lucide-react";
import { EmptyState } from "@/components/empty-states/EmptyState";

export function AlarmEmptyState() {
  return (
    <EmptyState
      icon={<AlarmClock className="size-6" aria-hidden="true" />}
      title="No alarms set"
      description="Create your first alarm to get reminders while Timeglass is open."
      className="mt-8"
    />
  );
}
