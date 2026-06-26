import { act, renderHook } from "@testing-library/react";
import { useAlarms } from "@/hooks/useAlarms";
import { AudioManager } from "@/lib/audio";
import type { Alarm } from "@/types";

const baseAlarm: Alarm = {
  id: "alarm-1",
  label: "Morning",
  time: "07:30",
  days: ["Fri"],
  enabled: true,
  sound: "bell",
};

function notificationMock() {
  return window.Notification as unknown as {
    instances: Array<{ title: string; options?: NotificationOptions }>;
    permission: NotificationPermission;
  };
}

describe("useAlarms", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 26, 7, 30, 0));
    jest.spyOn(AudioManager, "playAlarmSound").mockImplementation(jest.fn());
    jest.spyOn(AudioManager, "stopAllSounds").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("adds, updates, toggles, and deletes alarms", () => {
    const { result } = renderHook(() => useAlarms());

    act(() => {
      result.current.addAlarm(baseAlarm);
    });

    expect(result.current.alarms).toHaveLength(1);
    expect(result.current.hasEnabledAlarm).toBe(true);

    act(() => {
      result.current.toggleAlarm(baseAlarm.id);
    });

    expect(result.current.alarms[0].enabled).toBe(false);
    expect(result.current.hasEnabledAlarm).toBe(false);

    act(() => {
      result.current.updateAlarm(baseAlarm.id, { label: "Updated" });
    });

    expect(result.current.alarms[0].label).toBe("Updated");

    act(() => {
      result.current.deleteAlarm(baseAlarm.id);
    });

    expect(result.current.alarms).toEqual([]);
  });

  it("triggers a matching enabled alarm once per minute", () => {
    const notifications = notificationMock();
    const { result } = renderHook(() => useAlarms());

    act(() => {
      result.current.addAlarm(baseAlarm);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.activeAlarm?.id).toBe(baseAlarm.id);
    expect(AudioManager.playAlarmSound).toHaveBeenCalledWith("bell");
    expect(notifications.instances).toHaveLength(1);
    expect(notifications.instances[0].title).toBe("Timeglass Alarm");

    act(() => {
      result.current.dismissAlarm();
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.activeAlarm).toBeNull();
    expect(AudioManager.playAlarmSound).toHaveBeenCalledTimes(1);
  });

  it("does not trigger disabled alarms or alarms for another day", () => {
    const { result } = renderHook(() => useAlarms());

    act(() => {
      result.current.addAlarm({ ...baseAlarm, enabled: false });
      result.current.addAlarm({
        ...baseAlarm,
        id: "alarm-2",
        days: ["Mon"],
      });
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.activeAlarm).toBeNull();
    expect(AudioManager.playAlarmSound).not.toHaveBeenCalled();
  });

  it("snoozes an active alarm", () => {
    const { result } = renderHook(() => useAlarms());

    act(() => {
      result.current.addAlarm(baseAlarm);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.activeAlarm?.id).toBe(baseAlarm.id);

    act(() => {
      result.current.snoozeAlarm(baseAlarm.id);
    });

    expect(result.current.activeAlarm).toBeNull();
    expect(result.current.alarms[0].snoozeUntil).toBeDefined();
    expect(new Date(result.current.alarms[0].snoozeUntil ?? "").getTime()).toBe(
      new Date(2026, 5, 26, 7, 35, 1).getTime(),
    );
  });
});
