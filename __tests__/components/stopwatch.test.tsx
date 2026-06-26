import { render, screen } from "@testing-library/react";
import { LapList } from "@/components/stopwatch/LapList";

describe("LapList", () => {
  it("renders lap rows and best/worst markers", () => {
    render(
      <LapList
        laps={[
          { index: 2, lapTime: 750, totalTime: 2000 },
          { index: 1, lapTime: 1250, totalTime: 1250 },
        ]}
        bestLapIndex={0}
        worstLapIndex={1}
        onCopy={jest.fn()}
      />,
    );

    expect(screen.getByText("Laps")).toBeInTheDocument();
    expect(screen.getByText("Best")).toBeInTheDocument();
    expect(screen.getByText("Worst")).toBeInTheDocument();
  });
});
