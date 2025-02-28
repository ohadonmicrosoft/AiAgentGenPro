import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  /**
   * If true, clicking outside or pressing escape will not close the dialog
   */
  forceMount?: boolean;
}

const Dialog = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Root>,
  DialogProps
>(({ forceMount, ...props }, ref) => (
  <DialogPrimitive.Root {...props} />
));
Dialog.displayName = DialogPrimitive.Root.displayName;

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Trigger 
    ref={ref} 
    className={cn("focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)} 
    {...props}
    data-testid="dialog-trigger"
  />
));
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close 
    ref={ref} 
    className={cn(
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )} 
    {...props}
    data-testid="dialog-close"
  />
));
DialogClose.displayName = DialogPrimitive.Close.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    data-testid="dialog-overlay"
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * Set to false to disable the close button
   */
  showCloseButton?: boolean;
  /**
   * Animation variant for the dialog
   */
  animationVariant?: "default" | "centered" | "slide-up" | "none";
  /**
   * Callback triggered when the escape key is pressed
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ 
  className, 
  children, 
  showCloseButton = true, 
  animationVariant = "default",
  onEscapeKeyDown,
  ...props 
}, ref) => {
  let animationClasses = "";
  
  switch (animationVariant) {
    case "default":
      animationClasses = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]";
      break;
    case "centered":
      animationClasses = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";
      break;
    case "slide-up":
      animationClasses = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-[48%] data-[state=open]:slide-in-from-bottom-[48%]";
      break;
    case "none":
      animationClasses = "";
      break;
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
          animationClasses,
          "sm:rounded-lg",
          className,
        )}
        onEscapeKeyDown={onEscapeKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        {...props}
        data-testid="dialog-content"
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            data-testid="dialog-x-close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to center align the header content
   */
  centered?: boolean;
}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, centered = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        centered ? "text-center" : "text-left",
        className,
      )}
      {...props}
      data-testid="dialog-header"
    />
  )
);
DialogHeader.displayName = "DialogHeader";

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to stack buttons vertically on mobile
   */
  stackButtons?: boolean;
}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, stackButtons = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex",
        stackButtons ? "flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" : "flex-row justify-end space-x-2",
        className,
      )}
      {...props}
      data-testid="dialog-footer"
    />
  )
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    id="dialog-title"
    {...props}
    data-testid="dialog-title"
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    id="dialog-description"
    {...props}
    data-testid="dialog-description"
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogProps,
  type DialogContentProps,
  type DialogHeaderProps,
  type DialogFooterProps,
}; 