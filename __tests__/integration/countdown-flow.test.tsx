import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CountdownTab } from "@/components/countdown/CountdownTab";
import { AudioManager } from "@/lib/audio";

describe("Countdown flow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-26T07:00:00.000Z"));
    jest.spyOn(AudioManager, "playAlarmSound").mockImplementation(jest.fn());
    jest.spyOn(AudioManager, "stopAllSounds").mockImplementation(jest.fn());
    jest.spyOn(AudioManager, "unlock").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("starts, pauses, resumes, resets, and completes", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<CountdownTab />);

    await user.clear(screen.getByLabelText("Minutes"));
    await user.type(screen.getByLabelText("Minutes"), "0");
    await user.clear(screen.getByLabelText("Seconds"));
    await user.type(screen.getByLabelText("Seconds"), "1");

    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByText("Running")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByText("Paused")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(screen.getByText("Running")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Ready")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start" }));

    act(() => {
      jest.setSystemTime(new Date("2026-06-26T07:00:01.000Z"));
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(AudioManager.playAlarmSound).toHaveBeenCalledWith("digital");
  });
});
