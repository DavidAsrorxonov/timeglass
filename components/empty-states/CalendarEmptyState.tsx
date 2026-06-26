import { CalendarPlus } from "lucide-react";
import { EmptyState } from "@/components/empty-states/EmptyState";

export function CalendarEmptyState() {
  return (
    <EmptyState
      icon={<CalendarPlus className="size-6" aria-hidden="true" />}
      title="Nothing scheduled"
      description="Add your first event for this day."
      className="mt-6"
    />
  );
}
