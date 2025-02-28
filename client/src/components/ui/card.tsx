import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional variant for different card styles
   */
  variant?: "default" | "outline" | "ghost";
  /**
   * Whether to disable hover effects
   */
  disableHover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", disableHover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground transition-all duration-300",
        variant === "default" && "shadow-soft",
        variant === "ghost" && "border-none shadow-none bg-transparent",
        !disableHover && "hover:shadow-md card-hover",
        "card focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
      {...props}
      data-testid="card"
      tabIndex={props.onClick ? 0 : undefined}
      role={props.onClick ? "button" : undefined}
      onKeyDown={
        props.onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
    data-testid="card-header"
  />
));
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * HTML heading element level to use (h1-h6)
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Comp = "h3", ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(
        "text-xl sm:text-2xl font-bold leading-tight tracking-tight transition-all duration-300",
        className,
      )}
      {...props}
      data-testid="card-title"
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground transition-colors duration-300",
      className,
    )}
    {...props}
    data-testid="card-description"
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-4 sm:p-6 pt-0", className)} 
    {...props} 
    data-testid="card-content"
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-6 pt-0", className)}
    {...props}
    data-testid="card-footer"
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  type CardProps,
  type CardTitleProps,
}; 