import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent } from "../../../test/utils";
import { Button } from "../button";

describe("Button", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button", { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeDisabled();
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button", { name: /primary/i })).toHaveClass(
      "bg-primary",
    );

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button", { name: /destructive/i })).toHaveClass(
      "text-destructive",
    );

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button", { name: /outline/i })).toHaveClass(
      "border-input",
    );

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button", { name: /secondary/i })).toHaveClass(
      "bg-secondary",
    );

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button", { name: /ghost/i })).toHaveClass(
      "hover:bg-accent/50",
    );

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button", { name: /link/i })).toHaveClass(
      "underline-offset-4",
    );
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole("button", { name: /default/i })).toHaveClass(
      "h-10",
    );

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button", { name: /small/i })).toHaveClass("h-8");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button", { name: /large/i })).toHaveClass("h-11");

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button", { name: /icon/i })).toHaveClass(
      "h-9 w-9",
    );

    rerender(<Button size="xs">Extra Small</Button>);
    expect(screen.getByRole("button", { name: /extra small/i })).toHaveClass(
      "h-7",
    );

    rerender(<Button size="xl">Extra Large</Button>);
    expect(screen.getByRole("button", { name: /extra large/i })).toHaveClass(
      "h-12",
    );
  });

  it("renders with custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button", { name: /custom/i })).toHaveClass(
      "custom-class",
    );
  });

  it("renders with children", () => {
    render(
      <Button>
        <span data-testid="child">Child Element</span>
      </Button>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders as a slot when asChild is true", () => {
    render(
      <Button asChild>
        <a href="https://example.com">Link Button</a>
      </Button>,
    );

    const linkButton = screen.getByRole("link", { name: /link button/i });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute("href", "https://example.com");
    expect(linkButton).toHaveClass("bg-primary"); // Should still have button styling
  });

  it("prevents event propagation for nested clicks", async () => {
    const parentClick = vi.fn();
    const buttonClick = vi.fn();

    const { user } = render(
      <div onClick={parentClick} data-testid="parent">
        <Button onClick={buttonClick}>
          <span data-testid="child">Child Element</span>
        </Button>
      </div>,
    );

    // Click the child element within the button
    await user.click(screen.getByTestId("child"));

    // The button's click handler should be called
    expect(buttonClick).toHaveBeenCalledTimes(1);

    // The parent's click handler should not be called
    // due to stopPropagation in the button's click handler
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("gracefully handles errors in click handler", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const brokenHandler = vi.fn().mockImplementation(() => {
      throw new Error("Click handler error");
    });

    const { user } = render(
      <Button onClick={brokenHandler}>Error Button</Button>,
    );

    // Clicking should not throw an uncaught error
    await user.click(screen.getByRole("button", { name: /error button/i }));

    // Handler should have been called
    expect(brokenHandler).toHaveBeenCalledTimes(1);

    // Error should be logged
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error in button click handler:"),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
