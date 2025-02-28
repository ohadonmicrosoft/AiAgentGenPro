import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toggle } from "../toggle";
import { Bell } from "lucide-react";

describe("Toggle Component", () => {
  it("renders correctly with default props", () => {
    render(<Toggle>Toggle</Toggle>);

    const toggle = screen.getByTestId("toggle");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent("Toggle");
    expect(toggle).toHaveAttribute("data-state", "off");
  });

  it("toggles state when clicked", () => {
    render(<Toggle>Toggle</Toggle>);

    const toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveAttribute("data-state", "off");

    // Click to toggle on
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "on");

    // Click to toggle off
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "off");
  });

  it("calls onPressedChange when toggled", () => {
    const handlePressedChange = vi.fn();

    render(<Toggle onPressedChange={handlePressedChange}>Toggle</Toggle>);

    const toggle = screen.getByTestId("toggle");
    fireEvent.click(toggle);

    expect(handlePressedChange).toHaveBeenCalledTimes(1);
    expect(handlePressedChange).toHaveBeenCalledWith(true);

    fireEvent.click(toggle);

    expect(handlePressedChange).toHaveBeenCalledTimes(2);
    expect(handlePressedChange).toHaveBeenCalledWith(false);
  });

  it("respects disabled state", () => {
    render(<Toggle disabled>Toggle</Toggle>);

    const toggle = screen.getByTestId("toggle");
    expect(toggle).toBeDisabled();

    // Clicking should not change the state
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "off");
  });

  it("applies variant classNames correctly", () => {
    const { rerender } = render(<Toggle variant="default">Default</Toggle>);

    let toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("bg-transparent");

    rerender(<Toggle variant="outline">Outline</Toggle>);
    toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("border");
    expect(toggle).toHaveClass("border-input");

    rerender(<Toggle variant="solid">Solid</Toggle>);
    toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("bg-primary");
    expect(toggle).toHaveClass("text-primary-foreground");
  });

  it("applies size classNames correctly", () => {
    const { rerender } = render(<Toggle size="default">Default</Toggle>);

    let toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("h-10");
    expect(toggle).toHaveClass("px-3");

    rerender(<Toggle size="sm">Small</Toggle>);
    toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("h-9");
    expect(toggle).toHaveClass("px-2.5");

    rerender(<Toggle size="lg">Large</Toggle>);
    toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("h-11");
    expect(toggle).toHaveClass("px-5");

    rerender(
      <Toggle size="icon">
        <Bell />
      </Toggle>,
    );
    toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("h-10");
    expect(toggle).toHaveClass("w-10");
  });

  it("applies shape classNames correctly", () => {
    const { rerender } = render(<Toggle shape="default">Default</Toggle>);

    let toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("rounded-md");

    rerender(<Toggle shape="pill">Pill</Toggle>);
    toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("rounded-full");

    rerender(<Toggle shape="square">Square</Toggle>);
    toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveClass("rounded-none");
  });

  it("handles aria labeling correctly with explicit label prop", () => {
    render(<Toggle label="Notification Toggle">Bell</Toggle>);

    const toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveAttribute("aria-label", "Notification Toggle");

    // The visual label should be visually hidden for screen readers
    const srLabel = screen.getByText("Notification Toggle");
    expect(srLabel).toHaveClass("sr-only");
  });

  it("uses aria-label when provided alongside label prop", () => {
    render(
      <Toggle label="Visual Label" aria-label="Screen Reader Label">
        Toggle
      </Toggle>,
    );

    const toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveAttribute("aria-label", "Screen Reader Label");
  });

  it("works with icon children", () => {
    render(
      <Toggle size="icon" aria-label="Notifications">
        <Bell data-testid="bell-icon" />
      </Toggle>,
    );

    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
    expect(screen.getByTestId("toggle")).toHaveAttribute(
      "aria-label",
      "Notifications",
    );
  });

  it("passes additional props to the root element", () => {
    render(
      <Toggle
        data-custom="test-value"
        id="test-toggle"
        aria-controls="controlled-component"
      >
        Toggle
      </Toggle>,
    );

    const toggle = screen.getByTestId("toggle");
    expect(toggle).toHaveAttribute("data-custom", "test-value");
    expect(toggle).toHaveAttribute("id", "test-toggle");
    expect(toggle).toHaveAttribute("aria-controls", "controlled-component");
  });
});
