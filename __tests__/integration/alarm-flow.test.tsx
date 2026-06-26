import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlarmTab } from "@/components/alarm/AlarmTab";
import { useAlarms } from "@/hooks/useAlarms";

function AlarmHarness() {
  const alarmController = useAlarms();
  return <AlarmTab alarmController={alarmController} />;
}

describe("Alarm flow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 26, 7, 30, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates, toggles, edits, and deletes an alarm", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<AlarmHarness />);

    await user.click(screen.getByRole("button", { name: "New Alarm" }));
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "07:30" },
    });
    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "Morning" },
    });
    await user.click(screen.getByRole("button", { name: "Fri" }));
    await user.click(screen.getByRole("button", { name: /Digital/ }));
    await user.click(screen.getByRole("button", { name: "Save Alarm" }));

    expect(await screen.findByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("07:30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Disable alarm" }));
    expect(
      screen.getByRole("button", { name: "Enable alarm" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "Updated alarm" },
    });
    await user.click(screen.getByRole("button", { name: "Save Alarm" }));

    expect(await screen.findByText("Updated alarm")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("Updated alarm")).not.toBeInTheDocument();
    });
  });
});
