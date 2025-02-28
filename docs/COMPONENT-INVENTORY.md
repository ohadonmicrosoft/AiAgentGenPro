# Component Inventory

This document tracks the component migration status for the project restructuring. It categorizes all components and provides information about their dependencies, state management approach, and migration status.

## Core UI Components

| Component Name | Current Location | Target Location | Dependencies | State Management | Status | Notes |
|----------------|-----------------|-----------------|--------------|------------------|--------|-------|
| Accordion | client/src/components/ui/accordion.tsx | project-restructure/client/src/components/ui/accordion.tsx | radix-ui | - | ✅ Completed | Accessibility enhanced |
| Alert | client/src/components/ui/alert.tsx | project-restructure/client/src/components/ui/alert.tsx | react | - | ✅ Completed | Accessibility enhanced |
| AlertDialog | client/src/components/ui/alert-dialog.tsx | project-restructure/client/src/components/ui/alert-dialog.tsx | radix-ui | - | Pending | Modal dialog |
| AnimatedFormField | client/src/components/ui/animated-form-field.tsx | project-restructure/client/src/components/ui/animated-form-field.tsx | framer-motion | useState | Pending | Animation component |
| AspectRatio | client/src/components/ui/aspect-ratio.tsx | project-restructure/client/src/components/ui/aspect-ratio.tsx | radix-ui | - | Pending | Layout component |
| AsyncBoundary | client/src/components/ui/async-boundary.tsx | project-restructure/client/src/components/ui/async-boundary.tsx | react-query | - | Pending | Error handling |
| Avatar | client/src/components/ui/avatar.tsx | project-restructure/client/src/components/ui/avatar.tsx | radix-ui | - | Pending | Display component |
| Backdrop | client/src/components/ui/backdrop.tsx | project-restructure/client/src/components/ui/backdrop.tsx | react | - | Pending | Overlay component |
| Badge | client/src/components/ui/badge.tsx | project-restructure/client/src/components/ui/badge.tsx | react | - | Pending | Display component |
| BottomNavigation | client/src/components/ui/bottom-navigation.tsx | project-restructure/client/src/components/ui/bottom-navigation.tsx | react-router | useState | Pending | Navigation component |
| Breadcrumb | client/src/components/ui/breadcrumb.tsx | project-restructure/client/src/components/ui/breadcrumb.tsx | react-router | - | Pending | Navigation component |
| Button | client/src/components/ui/button.tsx | project-restructure/client/src/components/ui/button.tsx | react | - | ✅ Completed | With accessibility |
| ButtonGroup | client/src/components/ui/button-group.tsx | project-restructure/client/src/components/ui/button-group.tsx | react | - | Pending | Layout component |
| Calendar | client/src/components/ui/calendar.tsx | project-restructure/client/src/components/ui/calendar.tsx | date-fns, react-day-picker | useState | Pending | Date component |
| Card | client/src/components/ui/card.tsx | project-restructure/client/src/components/ui/card.tsx | react | - | ✅ Completed | Accessibility enhanced, added keyboard access |
| Carousel | client/src/components/ui/carousel.tsx | project-restructure/client/src/components/ui/carousel.tsx | embla-carousel-react | useState | Pending | Display component |
| Chart | client/src/components/ui/chart.tsx | project-restructure/client/src/components/ui/chart.tsx | recharts | - | Pending | Data visualization |
| Checkbox | client/src/components/ui/checkbox.tsx | project-restructure/client/src/components/ui/checkbox.tsx | radix-ui | - | Pending | Form component |
| Command | client/src/components/ui/command.tsx | project-restructure/client/src/components/ui/command.tsx | cmdk | useState | Pending | Command palette |
| ContextMenu | client/src/components/ui/context-menu.tsx | project-restructure/client/src/components/ui/context-menu.tsx | radix-ui | - | Pending | Menu component |
| Dialog | client/src/components/ui/dialog.tsx | project-restructure/client/src/components/ui/dialog.tsx | radix-ui | - | ✅ Completed | Enhanced with multiple animation variants and improved accessibility |
| DragHandle | client/src/components/ui/drag-handle.tsx | project-restructure/client/src/components/ui/drag-handle.tsx | react-dnd | useContext | Pending | Drag and drop |
| Draggable | client/src/components/ui/draggable.tsx | project-restructure/client/src/components/ui/draggable.tsx | react-dnd | useContext | Pending | Drag and drop |
| Drawer | client/src/components/ui/drawer.tsx | project-restructure/client/src/components/ui/drawer.tsx | vaul | useState | Pending | Mobile drawer |
| DropdownMenu | client/src/components/ui/dropdown-menu.tsx | project-restructure/client/src/components/ui/dropdown-menu.tsx | radix-ui | - | Pending | Menu component |
| Droppable | client/src/components/ui/droppable.tsx | project-restructure/client/src/components/ui/droppable.tsx | react-dnd | useContext | Pending | Drag and drop |
| ErrorBoundary | client/src/components/ui/error-boundary.tsx | project-restructure/client/src/components/ui/error-boundary.tsx | react | useState | ✅ Completed | Error handling |
| ErrorFallback | client/src/components/ui/error-fallback.tsx | project-restructure/client/src/components/ui/error-fallback.tsx | react | - | Pending | Error UI |
| FloatingLabelInput | client/src/components/ui/floating-label-input.tsx | project-restructure/client/src/components/ui/floating-label-input.tsx | react | useState | Pending | Form component |
| FocusTrap | N/A | project-restructure/client/src/components/ui/focus-trap.tsx | react | useEffect | ✅ Completed | Accessibility feature |
| Form | client/src/components/ui/form.tsx | project-restructure/client/src/components/ui/form.tsx | react-hook-form, zod | useForm | Pending | Form component |
| HoverCard | client/src/components/ui/hover-card.tsx | project-restructure/client/src/components/ui/hover-card.tsx | radix-ui | - | Pending | Display component |
| Input | client/src/components/ui/input.tsx | project-restructure/client/src/components/ui/input.tsx | react | - | Pending | Form component |
| InputOTP | client/src/components/ui/input-otp.tsx | project-restructure/client/src/components/ui/input-otp.tsx | react | useState | Pending | Form component |
| Label | client/src/components/ui/label.tsx | project-restructure/client/src/components/ui/label.tsx | radix-ui | - | Pending | Form component |
| LoadingIndicator | client/src/components/ui/loading-indicator.tsx | project-restructure/client/src/components/ui/loading-indicator.tsx | react | - | Pending | Feedback component |
| Menubar | client/src/components/ui/menubar.tsx | project-restructure/client/src/components/ui/menubar.tsx | radix-ui | - | Pending | Navigation component |
| NavigationMenu | client/src/components/ui/navigation-menu.tsx | project-restructure/client/src/components/ui/navigation-menu.tsx | radix-ui | - | Pending | Navigation component |
| OfflineIndicator | client/src/components/ui/offline-indicator.tsx | project-restructure/client/src/components/ui/offline-indicator.tsx | react | useContext | Pending | Status component |
| OptimizedImage | client/src/components/ui/optimized-image.tsx | project-restructure/client/src/components/ui/optimized-image.tsx | react | useState | Pending | Media component |
| Pagination | client/src/components/ui/pagination.tsx | project-restructure/client/src/components/ui/pagination.tsx | react | useState | Pending | Navigation component |
| Popover | client/src/components/ui/popover.tsx | project-restructure/client/src/components/ui/popover.tsx | radix-ui | - | Pending | Display component |
| Progress | client/src/components/ui/progress.tsx | project-restructure/client/src/components/ui/progress.tsx | radix-ui | - | Pending | Feedback component |
| RadioGroup | client/src/components/ui/radio-group.tsx | project-restructure/client/src/components/ui/radio-group.tsx | radix-ui | - | Pending | Form component |
| Resizable | client/src/components/ui/resizable.tsx | project-restructure/client/src/components/ui/resizable.tsx | react-resizable-panel | - | Pending | Layout component |
| ResponsiveContainer | client/src/components/ui/responsive-container.tsx | project-restructure/client/src/components/ui/responsive-container.tsx | react | useMediaQuery | Pending | Layout component |
| ScrollArea | client/src/components/ui/scroll-area.tsx | project-restructure/client/src/components/ui/scroll-area.tsx | radix-ui | - | Pending | Layout component |
| Select | client/src/components/ui/select.tsx | project-restructure/client/src/components/ui/select.tsx | radix-ui | - | Pending | Form component |
| Separator | client/src/components/ui/separator.tsx | project-restructure/client/src/components/ui/separator.tsx | radix-ui | - | Pending | Layout component |
| Sheet | client/src/components/ui/sheet.tsx | project-restructure/client/src/components/ui/sheet.tsx | radix-ui | - | Pending | Modal component |
| SidebarToggle | client/src/components/ui/sidebar-toggle.tsx | project-restructure/client/src/components/ui/sidebar-toggle.tsx | react | useContext | Pending | Navigation component |
| Skeleton | client/src/components/ui/skeleton.tsx | project-restructure/client/src/components/ui/skeleton.tsx | react | - | Pending | Feedback component |
| Slider | client/src/components/ui/slider.tsx | project-restructure/client/src/components/ui/slider.tsx | radix-ui | - | Pending | Form component |
| Spinner | client/src/components/ui/spinner.tsx | project-restructure/client/src/components/ui/spinner.tsx | react | - | Pending | Feedback component |
| Switch | client/src/components/ui/switch.tsx | project-restructure/client/src/components/ui/switch.tsx | radix-ui | - | Pending | Form component |
| Table | client/src/components/ui/table.tsx | project-restructure/client/src/components/ui/table.tsx | @tanstack/react-table | useContext | Pending | Data display |
| Tabs | client/src/components/ui/tabs.tsx | project-restructure/client/src/components/ui/tabs.tsx | radix-ui | - | ✅ Completed | Enhanced with vertical orientation and icon support |
| Textarea | client/src/components/ui/textarea.tsx | project-restructure/client/src/components/ui/textarea.tsx | react | - | Pending | Form component |
| Toast | client/src/components/ui/toast.tsx | project-restructure/client/src/components/ui/toast.tsx | sonner | - | Pending | Feedback component |
| Toaster | client/src/components/ui/toaster.tsx | project-restructure/client/src/components/ui/toaster.tsx | sonner | - | Pending | Feedback component |
| Toggle | client/src/components/ui/toggle.tsx | project-restructure/client/src/components/ui/toggle.tsx | radix-ui | - | ✅ Completed | Enhanced with new variants and accessibility features |
| ToggleGroup | client/src/components/ui/toggle-group.tsx | project-restructure/client/src/components/ui/toggle-group.tsx | radix-ui | - | Pending | Form component |
| Tooltip | client/src/components/ui/tooltip.tsx | project-restructure/client/src/components/ui/tooltip.tsx | radix-ui | - | Pending | Display component |
| TouchButton | client/src/components/ui/touch-button.tsx | project-restructure/client/src/components/ui/touch-button.tsx | react | useState | Pending | Mobile component |
| VirtualizedList | N/A | project-restructure/client/src/components/ui/virtualized-list.tsx | @tanstack/react-virtual | useRef | ✅ Completed | Performance component |

## Feature-Specific Components

| Component Name | Current Location | Target Location | Dependencies | State Management | Status | Notes |
|----------------|-----------------|-----------------|--------------|------------------|--------|-------|
| AgentCard | client/src/components/AgentCard.tsx | project-restructure/client/src/components/agents/agent-card.tsx | react | useContext | Pending | Agent UI |
| AgentTester | client/src/components/AgentTester.tsx | project-restructure/client/src/components/agents/agent-tester.tsx | react, api | useState, useQuery | Pending | Agent testing |
| Announcer | client/src/components/Announcer.tsx | project-restructure/client/src/components/common/announcer.tsx | react | useContext | Pending | Accessibility |
| PaletteGenerator | client/src/components/palette-generator.tsx | project-restructure/client/src/components/theming/palette-generator.tsx | react | useState | Pending | Theme utility |
| QuickActionCard | client/src/components/QuickActionCard.tsx | project-restructure/client/src/components/dashboard/quick-action-card.tsx | react-router | - | Pending | Dashboard UI |
| SkipLink | client/src/components/SkipLink.tsx | project-restructure/client/src/components/common/skip-link.tsx | react | - | Pending | Accessibility |
| StatsCard | client/src/components/StatsCard.tsx | project-restructure/client/src/components/dashboard/stats-card.tsx | recharts | - | Pending | Dashboard UI |
| ThemeToggle | client/src/components/theme-toggle.tsx | project-restructure/client/src/components/theming/theme-toggle.tsx | react | useContext | Pending | Theme control |

## Layout Components

| Component Name | Current Location | Target Location | Dependencies | State Management | Status | Notes |
|----------------|-----------------|-----------------|--------------|------------------|--------|-------|
| Sidebar | client/src/components/Sidebar.tsx | project-restructure/client/src/layouts/sidebar/index.tsx | react-router | useContext | Pending | Main sidebar |
| TopNav | client/src/components/TopNav.tsx | project-restructure/client/src/layouts/top-nav/index.tsx | react-router | useContext | Pending | Top navigation |

## Page Components

These will be migrated after the UI and feature-specific components are completed.

## Migration Priority

1. Remaining core UI components (needed by many other components)
2. Feature-specific components (dependent on UI components)
3. Layout components (dependent on both UI and feature components)
4. Page components (dependent on all the above)

## Next Steps

1. Complete migration of core UI components
2. Migrate feature-specific components
3. Migrate layout components
4. Implement component tests
5. Update documentation 