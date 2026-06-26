import { Globe2 } from "lucide-react";
import { EmptyState } from "@/components/empty-states/EmptyState";

export function TimezoneEmptyState() {
  return (
    <EmptyState
      icon={<Globe2 className="size-6" aria-hidden="true" />}
      title="No saved timezones"
      description="Add a city to compare time around the world."
    />
  );
}
