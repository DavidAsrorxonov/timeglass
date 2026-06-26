import { render, screen } from "@testing-library/react";
import {
  CountdownRing,
  formatDuration,
} from "@/components/countdown/CountdownRing";

describe("CountdownRing", () => {
  it("formats duration and renders status", () => {
    expect(formatDuration(61_000)).toBe("00:01:01");

    render(
      <CountdownRing remainingMs={61_000} progress={0.5} status="paused" />,
    );

    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByText("00:01:01")).toBeInTheDocument();
  });
});
