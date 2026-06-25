"use client";

import { useEffect, useMemo, useState } from "react";

export interface ClockState {
  date: Date;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  dayOfWeek: string;
}

function getTimeParts(timezone?: string): ClockState {
  const now = new Date();

  if (!timezone) {
    return {
      date: now,
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      milliseconds: now.getMilliseconds(),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
    };
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "long",
      hour12: false,
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: Intl.DateTimeFormatPartTypes) => {
      return parts.find((part) => part.type === type)?.value ?? "0";
    };

    return {
      date: now,
      hours: Number(getPart("hour")),
      minutes: Number(getPart("minute")),
      seconds: Number(getPart("second")),
      milliseconds: now.getMilliseconds(),
      dayOfWeek: getPart("weekday"),
    };
  } catch {
    return {
      date: now,
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      milliseconds: now.getMilliseconds(),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
    };
  }
}

export function useClock(timezone?: string) {
  const [clock, setClock] = useState<ClockState>(() => getTimeParts(timezone));

  useEffect(() => {
    let frameId: number;

    const tick = () => {
      setClock(getTimeParts(timezone));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [timezone]);

  return useMemo(() => clock, [clock]);
}
