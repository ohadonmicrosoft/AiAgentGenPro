import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "../card";

describe("Card Component", () => {
  it("renders all card subcomponents properly", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card Title</CardTitle>
          <CardDescription>This is a test card description</CardDescription>
        </CardHeader>
        <CardContent>This is the card content</CardContent>
        <CardFooter>Card Footer Content</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toBeInTheDocument();
    expect(screen.getByTestId("card-description")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
    expect(screen.getByTestId("card-footer")).toBeInTheDocument();

    expect(screen.getByText("Test Card Title")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test card description"),
    ).toBeInTheDocument();
    expect(screen.getByText("This is the card content")).toBeInTheDocument();
    expect(screen.getByText("Card Footer Content")).toBeInTheDocument();
  });

  it("applies classNames correctly", () => {
    render(
      <Card className="test-class">
        <CardHeader className="header-test-class">
          <CardTitle className="title-test-class">Title</CardTitle>
          <CardDescription className="desc-test-class">
            Description
          </CardDescription>
        </CardHeader>
        <CardContent className="content-test-class">Content</CardContent>
        <CardFooter className="footer-test-class">Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card")).toHaveClass("test-class");
    expect(screen.getByTestId("card-header")).toHaveClass("header-test-class");
    expect(screen.getByTestId("card-title")).toHaveClass("title-test-class");
    expect(screen.getByTestId("card-description")).toHaveClass(
      "desc-test-class",
    );
    expect(screen.getByTestId("card-content")).toHaveClass(
      "content-test-class",
    );
    expect(screen.getByTestId("card-footer")).toHaveClass("footer-test-class");
  });

  it("supports different card variants", () => {
    const { rerender } = render(<Card variant="default">Card Content</Card>);

    // Default variant
    let cardElement = screen.getByTestId("card");
    expect(cardElement).toHaveClass("shadow-soft");
    expect(cardElement).not.toHaveClass("border-none");

    // Ghost variant
    rerender(<Card variant="ghost">Card Content</Card>);
    cardElement = screen.getByTestId("card");
    expect(cardElement).toHaveClass("border-none");
    expect(cardElement).toHaveClass("shadow-none");
    expect(cardElement).toHaveClass("bg-transparent");
  });

  it("supports custom heading levels for CardTitle", () => {
    const { rerender } = render(<CardTitle as="h1">Heading 1</CardTitle>);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

    rerender(<CardTitle as="h2">Heading 2</CardTitle>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();

    rerender(<CardTitle as="h6">Heading 6</CardTitle>);
    expect(screen.getByRole("heading", { level: 6 })).toBeInTheDocument();

    // Default should be h3
    rerender(<CardTitle>Default Heading</CardTitle>);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("has keyboard accessibility when clickable", () => {
    const handleClick = vi.fn();

    render(<Card onClick={handleClick}>Clickable Card</Card>);

    const card = screen.getByTestId("card");

    // Should have button role and be focusable
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabIndex", "0");

    // Enter key should trigger click
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Space key should trigger click
    fireEvent.keyDown(card, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Other keys should not trigger click
    fireEvent.keyDown(card, { key: "a" });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("does not have button role or keyboard handling when not clickable", () => {
    render(<Card>Non-clickable Card</Card>);

    const card = screen.getByTestId("card");

    // Should not have button role or tabIndex
    expect(card).not.toHaveAttribute("role", "button");
    expect(card).not.toHaveAttribute("tabIndex", "0");
  });
});
