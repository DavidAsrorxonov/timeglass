import { render, screen } from "@testing-library/react";
import { PomodoroRing } from "@/components/pomodoro/PomodoroRing";
import { FOCUS_DURATION, LONG_BREAK_DURATION } from "@/hooks/usePomodoro";

describe("PomodoroRing", () => {
  it("renders focus and long-break labels", () => {
    const { rerender } = render(
      <PomodoroRing phase="focus" remainingMs={FOCUS_DURATION} progress={1} />,
    );

    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByText("25:00")).toBeInTheDocument();

    rerender(
      <PomodoroRing
        phase="break"
        remainingMs={LONG_BREAK_DURATION}
        progress={1}
        isLongBreak
      />,
    );

    expect(screen.getByText("Long Break")).toBeInTheDocument();
    expect(screen.getByText("15:00")).toBeInTheDocument();
  });
});
