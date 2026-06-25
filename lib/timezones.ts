import type { Timezone } from "@/types";

export const DEFAULT_TIMEZONES: Timezone[] = [
  {
    id: "Asia/Tokyo",
    city: "Tokyo",
    region: "Japan",
    offset: "+09:00",
    pinned: true,
  },
  {
    id: "Asia/Tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
    offset: "+05:00",
    pinned: false,
  },
  {
    id: "Europe/London",
    city: "London",
    region: "United Kingdom",
    offset: "+00:00",
    pinned: false,
  },
  {
    id: "America/New_York",
    city: "New York",
    region: "United States",
    offset: "-05:00",
    pinned: false,
  },
];

export const TIMEZONE_OPTIONS = [
  {
    id: "Asia/Tokyo",
    city: "Tokyo",
    region: "Japan",
  },
  {
    id: "Asia/Tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
  },
  {
    id: "Europe/London",
    city: "London",
    region: "United Kingdom",
  },
  {
    id: "America/New_York",
    city: "New York",
    region: "United States",
  },
  {
    id: "Europe/Paris",
    city: "Paris",
    region: "France",
  },
  {
    id: "Asia/Dubai",
    city: "Dubai",
    region: "United Arab Emirates",
  },
] as const;
