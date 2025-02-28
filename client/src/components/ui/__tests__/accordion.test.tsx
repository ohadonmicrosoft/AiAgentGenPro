import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../accordion";

describe("Accordion Component", () => {
  it("renders properly with all subcomponents", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Trigger 1</AccordionTrigger>
          <AccordionContent>Accordion Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Accordion Trigger 2</AccordionTrigger>
          <AccordionContent>Accordion Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText("Accordion Trigger 1")).toBeInTheDocument();
    expect(screen.getByText("Accordion Trigger 2")).toBeInTheDocument();
  });

  it("expands and collapses content when trigger is clicked", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Trigger</AccordionTrigger>
          <AccordionContent>Accordion Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    // Content is initially collapsed
    const content = screen.getByText("Accordion Content");
    expect(content.parentElement).toHaveAttribute("data-state", "closed");

    // Click to expand
    const trigger = screen.getByText("Accordion Trigger");
    fireEvent.click(trigger);

    // Content should be expanded
    expect(content.parentElement).toHaveAttribute("data-state", "open");

    // Click to collapse again
    fireEvent.click(trigger);

    // Content should be collapsed again
    expect(content.parentElement).toHaveAttribute("data-state", "closed");
  });

  it('allows multiple items to be open when type is "multiple"', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Trigger 1</AccordionTrigger>
          <AccordionContent>Accordion Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Accordion Trigger 2</AccordionTrigger>
          <AccordionContent>Accordion Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    // Both initially closed
    const content1 = screen.getByText("Accordion Content 1");
    const content2 = screen.getByText("Accordion Content 2");
    expect(content1.parentElement).toHaveAttribute("data-state", "closed");
    expect(content2.parentElement).toHaveAttribute("data-state", "closed");

    // Open first accordion
    const trigger1 = screen.getByText("Accordion Trigger 1");
    fireEvent.click(trigger1);
    expect(content1.parentElement).toHaveAttribute("data-state", "open");
    expect(content2.parentElement).toHaveAttribute("data-state", "closed");

    // Open second accordion - first should stay open
    const trigger2 = screen.getByText("Accordion Trigger 2");
    fireEvent.click(trigger2);
    expect(content1.parentElement).toHaveAttribute("data-state", "open");
    expect(content2.parentElement).toHaveAttribute("data-state", "open");
  });

  it("has proper accessibility attributes", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Trigger</AccordionTrigger>
          <AccordionContent>Accordion Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByTestId("accordion-trigger");
    expect(trigger).toHaveAttribute("aria-description");

    // The chevron icon should be hidden from screen readers
    const chevron = trigger.querySelector("svg");
    expect(chevron).toHaveAttribute("aria-hidden", "true");
  });
});
