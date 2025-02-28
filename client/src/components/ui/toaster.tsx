import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        className: "rounded-md border bg-background text-foreground",
        descriptionClassName: "text-muted-foreground text-sm",
      }}
    />
  );
}; 