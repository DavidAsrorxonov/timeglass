import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarTab } from "@/components/calendar/CalendarTab";

describe("Calendar flow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 26, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("adds, edits, and deletes a local event", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<CalendarTab />);

    await user.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Study session" },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "09:30" },
    });
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Study session")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Edit Study session" }),
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated session" },
    });
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Updated session")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete Updated session" }),
    );

    await waitFor(() => {
      expect(screen.queryByText("Updated session")).not.toBeInTheDocument();
    });
  });
});
