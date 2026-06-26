import { act, renderHook } from "@testing-library/react";
import {
  FOCUS_DURATION,
  LONG_BREAK_DURATION,
  SHORT_BREAK_DURATION,
  usePomodoro,
} from "@/hooks/usePomodoro";

describe("usePomodoro", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-26T09:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("moves through focus and break phases while preserving stats on reset", () => {
    const { result } = renderHook(() => usePomodoro());

    expect(result.current.phase).toBe("idle");
    expect(result.current.currentDuration).toBe(FOCUS_DURATION);

    act(() => {
      result.current.startFocus();
    });

    expect(result.current.phase).toBe("focus");

    act(() => {
      result.current.completeFocusSession();
    });

    expect(result.current.phase).toBe("break");
    expect(result.current.currentDuration).toBe(SHORT_BREAK_DURATION);
    expect(result.current.stats.completedPomodoros).toBe(1);
    expect(result.current.stats.totalFocusMinutes).toBe(25);
    expect(result.current.stats.streak).toBe(1);
    expect(result.current.stats.lastDate).toBe("2026-06-26");

    act(() => {
      result.current.completeBreakSession();
    });

    expect(result.current.phase).toBe("focus");

    for (let index = 0; index < 3; index += 1) {
      act(() => {
        result.current.completeFocusSession();
      });
      if (index < 2) {
        act(() => {
          result.current.completeBreakSession();
        });
      }
    }

    expect(result.current.cycleCount).toBe(4);
    expect(result.current.phase).toBe("break");
    expect(result.current.useLongBreak).toBe(true);
    expect(result.current.currentDuration).toBe(LONG_BREAK_DURATION);
    expect(result.current.stats.completedPomodoros).toBe(4);
    expect(result.current.stats.totalFocusMinutes).toBe(100);

    act(() => {
      result.current.reset();
    });

    expect(result.current.phase).toBe("idle");
    expect(result.current.cycleCount).toBe(0);
    expect(result.current.stats.completedPomodoros).toBe(4);
  });

  it("skipPhase starts focus from idle and alternates active phases", () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => {
      result.current.skipPhase();
    });

    expect(result.current.phase).toBe("focus");

    act(() => {
      result.current.skipPhase();
    });

    expect(result.current.phase).toBe("break");

    act(() => {
      result.current.skipPhase();
    });

    expect(result.current.phase).toBe("focus");
  });
});
