import { act, renderHook } from "@testing-library/react";
import { useTimer } from "@/hooks/useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-26T07:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts, pauses, resumes, resets, and calculates progress", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.startTimer(5000);
    });

    expect(result.current.status).toBe("running");
    expect(result.current.remainingMs).toBe(5000);
    expect(result.current.progress).toBe(1);

    act(() => {
      jest.setSystemTime(new Date("2026-06-26T07:00:02.000Z"));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.remainingMs).toBeGreaterThanOrEqual(2900);
    expect(result.current.remainingMs).toBeLessThanOrEqual(3000);
    expect(result.current.progress).toBeCloseTo(0.6);

    act(() => {
      result.current.pause();
    });

    expect(result.current.status).toBe("paused");
    expect(result.current.remainingMs).toBeGreaterThanOrEqual(2900);
    expect(result.current.remainingMs).toBeLessThanOrEqual(3000);

    act(() => {
      jest.setSystemTime(new Date("2026-06-26T07:00:10.000Z"));
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.remainingMs).toBeGreaterThanOrEqual(2900);
    expect(result.current.remainingMs).toBeLessThanOrEqual(3000);

    act(() => {
      result.current.resume();
    });

    expect(result.current.status).toBe("running");

    act(() => {
      jest.setSystemTime(new Date("2026-06-26T07:00:12.000Z"));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.remainingMs).toBeGreaterThanOrEqual(1900);
    expect(result.current.remainingMs).toBeLessThanOrEqual(2000);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.durationMs).toBe(0);
  });

  it("reaches done and calls onComplete once", () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useTimer({ onComplete }));

    act(() => {
      result.current.startTimer(1000);
    });

    act(() => {
      jest.setSystemTime(new Date("2026-06-26T07:00:01.000Z"));
      jest.advanceTimersByTime(16);
    });

    expect(result.current.status).toBe("done");
    expect(result.current.remainingMs).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
