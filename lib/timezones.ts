import type { Timezone } from "@/types";

export const DEFAULT_TIMEZONES: Timezone[] = [
  {
    id: "asia-tokyo",
    city: "Tokyo",
    region: "Japan",
    timezone: "Asia/Tokyo",
    offset: "+09:00",
    pinned: true,
  },
  {
    id: "asia-tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
    timezone: "Asia/Tashkent",
    offset: "+05:00",
    pinned: false,
  },
];

export const TIMEZONE_OPTIONS: Timezone[] = [
  {
    id: "asia-tokyo",
    city: "Tokyo",
    region: "Japan",
    timezone: "Asia/Tokyo",
    offset: "+09:00",
    pinned: false,
  },
  {
    id: "asia-tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
    timezone: "Asia/Tashkent",
    offset: "+05:00",
    pinned: false,
  },
  {
    id: "europe-london",
    city: "London",
    region: "United Kingdom",
    timezone: "Europe/London",
    offset: "+00:00",
    pinned: false,
  },
  {
    id: "america-new-york",
    city: "New York",
    region: "United States",
    timezone: "America/New_York",
    offset: "-05:00",
    pinned: false,
  },
  {
    id: "europe-paris",
    city: "Paris",
    region: "France",
    timezone: "Europe/Paris",
    offset: "+01:00",
    pinned: false,
  },
  {
    id: "asia-dubai",
    city: "Dubai",
    region: "United Arab Emirates",
    timezone: "Asia/Dubai",
    offset: "+04:00",
    pinned: false,
  },
  {
    id: "asia-seoul",
    city: "Seoul",
    region: "South Korea",
    timezone: "Asia/Seoul",
    offset: "+09:00",
    pinned: false,
  },
  {
    id: "australia-sydney",
    city: "Sydney",
    region: "Australia",
    timezone: "Australia/Sydney",
    offset: "+10:00",
    pinned: false,
  },
];

export function getLocalTimezone() {
  if (typeof window === "undefined") {
    return "UTC";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function normalizeTimezone(timezone: Timezone): Timezone {
  const knownTimezone = TIMEZONE_OPTIONS.find((option) => {
    return option.id === timezone.id || option.timezone === timezone.id;
  });

  if (knownTimezone) {
    return {
      ...knownTimezone,
      pinned: timezone.pinned,
    };
  }

  return {
    ...timezone,
    timezone: timezone.timezone ?? timezone.id,
  };
}
