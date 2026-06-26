import { render, screen } from "@testing-library/react";
import {
  MiniCalendar,
  toLocalDateKey,
} from "@/components/calendar/MiniCalendar";

describe("MiniCalendar", () => {
  it("renders the month grid and event indicators", () => {
    render(
      <MiniCalendar
        visibleMonth={new Date("2026-06-01T00:00:00")}
        selectedDate={new Date("2026-06-26T00:00:00")}
        eventDateKeys={new Set(["2026-06-26"])}
        onSelectDate={jest.fn()}
        onPreviousMonth={jest.fn()}
        onNextMonth={jest.fn()}
        onToday={jest.fn()}
      />,
    );

    expect(toLocalDateKey(new Date("2026-06-26T00:00:00"))).toBe("2026-06-26");
    expect(screen.getByText("June 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Friday, June 26, 2026, today, has events/,
      }),
    ).toBeInTheDocument();
  });
});
