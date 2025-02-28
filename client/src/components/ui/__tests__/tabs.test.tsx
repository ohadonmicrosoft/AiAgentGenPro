import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";
import { Home, Settings, User } from "lucide-react";

describe("Tabs Component", () => {
  it("renders horizontal tabs properly", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
        <TabsContent value="tab3">Tab 3 Content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByTestId("tabs-root")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
    expect(screen.getAllByTestId("tabs-trigger")).toHaveLength(3);
    expect(screen.getAllByTestId("tabs-content")).toHaveLength(3);

    // First tab should be active by default
    expect(screen.getByText("Tab 1")).toHaveAttribute("data-state", "active");
    expect(screen.getByText("Tab 2")).toHaveAttribute("data-state", "inactive");

    // First tab content should be visible
    expect(screen.getByText("Tab 1 Content")).toBeVisible();

    // Other tab contents should be invisible
    expect(screen.getByText("Tab 2 Content")).not.toBeVisible();
    expect(screen.getByText("Tab 3 Content")).not.toBeVisible();
  });

  it("switches tabs when clicking on triggers", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>,
    );

    // First tab is active by default
    expect(screen.getByText("Tab 1 Content")).toBeVisible();
    expect(screen.getByText("Tab 2 Content")).not.toBeVisible();

    // Click on second tab
    fireEvent.click(screen.getByText("Tab 2"));

    // Second tab content should now be visible
    expect(screen.getByText("Tab 1 Content")).not.toBeVisible();
    expect(screen.getByText("Tab 2 Content")).toBeVisible();

    // Second tab should have active state
    expect(screen.getByText("Tab 1")).toHaveAttribute("data-state", "inactive");
    expect(screen.getByText("Tab 2")).toHaveAttribute("data-state", "active");

    // Click back to first tab
    fireEvent.click(screen.getByText("Tab 1"));

    // First tab content should be visible again
    expect(screen.getByText("Tab 1 Content")).toBeVisible();
    expect(screen.getByText("Tab 2 Content")).not.toBeVisible();
  });

  it("renders vertical tabs properly", () => {
    render(
      <Tabs orientation="vertical" defaultValue="tab1">
        <TabsList vertical>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>,
    );

    // Check for vertical orientation attribute
    expect(screen.getByTestId("tabs-root")).toHaveAttribute(
      "orientation",
      "vertical",
    );
    expect(screen.getByTestId("tabs-list")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );

    // The tabs-list should have flex-col class for vertical layout
    expect(screen.getByTestId("tabs-list")).toHaveClass("flex-col");
  });

  it("renders tabs with icons", () => {
    render(
      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home" icon={<Home data-testid="home-icon" />}>
            Home
          </TabsTrigger>
          <TabsTrigger value="profile" icon={<User data-testid="user-icon" />}>
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            icon={<Settings data-testid="settings-icon" />}
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home">Home Content</TabsContent>
        <TabsContent value="profile">Profile Content</TabsContent>
        <TabsContent value="settings">Settings Content</TabsContent>
      </Tabs>,
    );

    // Icons should be rendered
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
  });

  it("supports fade-in animation for tab content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2" fadeIn>
          Tab 2 Content
        </TabsContent>
      </Tabs>,
    );

    // Second tab content should have animation class when fadeIn is true
    const tab2Content = screen
      .getByText("Tab 2 Content")
      .closest('[data-testid="tabs-content"]');
    expect(tab2Content).toHaveClass("animate-fadeIn");

    // First tab content should not have animation class (fadeIn not set)
    const tab1Content = screen
      .getByText("Tab 1 Content")
      .closest('[data-testid="tabs-content"]');
    expect(tab1Content).not.toHaveClass("animate-fadeIn");
  });

  it("respects disabled state on triggers", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>,
    );

    const tab2Trigger = screen.getByText("Tab 2");
    expect(tab2Trigger).toBeDisabled();

    // Click on disabled tab shouldn't change content
    fireEvent.click(tab2Trigger);
    expect(screen.getByText("Tab 1 Content")).toBeVisible();
    expect(screen.getByText("Tab 2 Content")).not.toBeVisible();
  });
});
