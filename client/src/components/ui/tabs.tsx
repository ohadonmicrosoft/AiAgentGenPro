import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  /**
   * Optional orientation for the tabs
   */
  orientation?: "horizontal" | "vertical";
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn(
      orientation === "vertical" && "flex",
      className
    )}
    orientation={orientation === "vertical" ? "vertical" : "horizontal"}
    {...props}
    data-testid="tabs-root"
  />
));

Tabs.displayName = TabsPrimitive.Root.displayName;

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /**
   * Whether this list is part of vertical tabs
   */
  vertical?: boolean;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, vertical = false, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      vertical ? "flex-col h-auto" : "h-10 inline-flex",
      className,
    )}
    {...props}
    data-testid="tabs-list"
    aria-orientation={vertical ? "vertical" : "horizontal"}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /**
   * Icon element to display before the tab text
   */
  icon?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, icon, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
    data-testid="tabs-trigger"
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  /**
   * Whether to fade in the content when shown
   */
  fadeIn?: boolean;
}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, fadeIn = false, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      fadeIn && "animate-fadeIn",
      className,
    )}
    {...props}
    data-testid="tabs-content"
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
}; 