import { act, renderHook } from "@testing-library/react";
import { useStopwatch } from "@/hooks/useStopwatch";

describe("useStopwatch", () => {
  let now = 0;
  let performanceNow: jest.SpyInstance<number, []>;

  beforeEach(() => {
    jest.useFakeTimers();
    now = 0;
    performanceNow = jest.spyOn(performance, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    performanceNow.mockRestore();
    jest.useRealTimers();
  });

  it("starts, stops, resumes, resets, and records laps", () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("running");

    act(() => {
      now = 1250;
      jest.advanceTimersByTime(16);
    });

    expect(result.current.elapsed).toBe(1250);

    act(() => {
      result.current.lap();
    });

    expect(result.current.laps[0]).toMatchObject({
      index: 1,
      lapTime: 1250,
      totalTime: 1250,
    });
    expect(result.current.bestLapIndex).toBeNull();
    expect(result.current.worstLapIndex).toBeNull();

    act(() => {
      now = 2000;
      result.current.lap();
    });

    expect(result.current.laps[0]).toMatchObject({
      index: 2,
      lapTime: 750,
      totalTime: 2000,
    });
    expect(result.current.bestLapIndex).toBe(0);
    expect(result.current.worstLapIndex).toBe(1);

    act(() => {
      result.current.stop();
    });

    expect(result.current.status).toBe("paused");
    expect(result.current.elapsed).toBe(2000);

    act(() => {
      now = 5000;
      result.current.start();
    });

    act(() => {
      now = 5500;
      jest.advanceTimersByTime(16);
    });

    expect(result.current.status).toBe("running");
    expect(result.current.elapsed).toBe(2500);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.elapsed).toBe(0);
    expect(result.current.laps).toEqual([]);
  });

  it("does not record laps while idle", () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.lap();
    });

    expect(result.current.laps).toEqual([]);
  });
});
