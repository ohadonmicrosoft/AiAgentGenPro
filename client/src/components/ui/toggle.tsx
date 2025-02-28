import * as TogglePrimitive from "@radix-ui/react-toggle";
import { type VariantProps, cva } from "../../lib/cva-local";
import * as React from "react";

import { cn } from "../../lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        solid:
          "bg-primary text-primary-foreground hover:bg-primary/90 data-[state=on]:bg-primary/90",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
        icon: "h-10 w-10",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {
  /**
   * An accessible label for the toggle. If not provided, an aria-label or aria-labelledby must be passed.
   */
  label?: string;
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(
  (
    {
      className,
      variant,
      size,
      shape,
      label,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    // If label is provided but aria-label is not, use label as aria-label
    const accessibilityLabel = ariaLabel || label;

    return (
      <TogglePrimitive.Root
        ref={ref}
        className={cn(toggleVariants({ variant, size, shape, className }))}
        aria-label={accessibilityLabel}
        data-testid="toggle"
        {...props}
      >
        {props.children}
        {label && <span className="sr-only">{label}</span>}
      </TogglePrimitive.Root>
    );
  },
);

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants, type ToggleProps };
