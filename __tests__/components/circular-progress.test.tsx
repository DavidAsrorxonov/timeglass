import { render } from "@testing-library/react";
import { CircularProgress } from "@/components/ui/CircularProgress";

describe("CircularProgress", () => {
  it("updates the visible stroke offset when progress changes", () => {
    const { container, rerender } = render(<CircularProgress value={1} />);
    const progressCircle = container.querySelectorAll("circle")[1];
    const initialOffset = progressCircle?.style.strokeDashoffset;

    rerender(<CircularProgress value={0.5} />);

    expect(progressCircle?.style.strokeDashoffset).not.toBe(initialOffset);
    expect(progressCircle?.style.transition).toBe("");
  });
});
