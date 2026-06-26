import { render, screen } from "@testing-library/react";
import { AlarmRingingOverlay } from "@/components/alarm/AlarmTab";

describe("AlarmRingingOverlay", () => {
  it("renders alarm details and actions", () => {
    render(
      <AlarmRingingOverlay
        alarm={{
          id: "alarm-1",
          label: "Morning",
          time: "07:30",
          days: [],
          enabled: true,
          sound: "bell",
        }}
        onDismiss={jest.fn()}
        onSnooze={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "07:30 AM" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Snooze 5 min" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });
});
