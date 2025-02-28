import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  User,
  Bell,
  Settings,
  Share,
  MoreVertical,
  Trash,
  Edit,
  Copy,
} from "lucide-react";

// Example 1: Confirmation Dialog
export function ConfirmationDialog() {
  const { toast } = useToast();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Dangerous Action</CardTitle>
        <CardDescription>
          This requires confirmation before proceeding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to see a confirmation dialog that helps prevent
          accidental actions.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  toast.success(
                    "Account deleted",
                    "Your account has been successfully deleted",
                  );
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Used for critical actions that require explicit confirmation</p>
      </CardFooter>
    </Card>
  );
}

// Example 2: Advanced Dropdown Menu
export function AdvancedDropdownMenu() {
  const [position, setPosition] = useState("bottom");
  const { toast } = useToast();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Dropdown Menu</CardTitle>
        <CardDescription>
          A versatile dropdown with multiple options and sections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This example shows a rich dropdown menu with various interactive
          elements.
        </p>

        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Options <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => toast.info("Profile", "Profile clicked")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.info("Settings", "Settings clicked")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.info("Notifications", "Notifications clicked")
                  }
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Share className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => toast.info("Share", "Copied to clipboard")}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.info("Share", "Shared via email")}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Email</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>Position</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={position}
                      onValueChange={setPosition}
                    >
                      <DropdownMenuRadioItem value="top">
                        Top
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="bottom">
                        Bottom
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="left">
                        Left
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="right">
                        Right
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  toast.warning("Logout", "You've been logged out")
                }
                className="text-red-500"
              >
                <span>Logout</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>
          Current position: <Badge variant="outline">{position}</Badge>
        </p>
      </CardFooter>
    </Card>
  );
}

// Example 3: Tooltip Examples
export function TooltipExamples() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Tooltips</CardTitle>
        <CardDescription>
          Tooltips provide additional information on hover.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Hover over these elements to see different tooltip styles and
          positions.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover Me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Basic tooltip with useful information</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary">Position Top</Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Appears above the element</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default">Position Right</Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Rich Content Tooltip</p>
                  <p className="text-xs text-muted-foreground">
                    Can contain multiple lines and formatting
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-destructive text-destructive-foreground"
              >
                <p>Permanently delete this item</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Tooltips help improve usability by providing context</p>
      </CardFooter>
    </Card>
  );
}

// Example 4: Popover Examples
export function PopoverExamples() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Popovers</CardTitle>
        <CardDescription>
          Interactive popovers for more complex interactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Popovers are like tooltips but allow for more complex interactions.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {/* Simple information popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">More Info</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Information</h4>
                  <p className="text-sm text-muted-foreground">
                    This is a popover component that can show additional
                    information or controls.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Form inside popover */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">Edit Profile</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Quick Edit</h4>
                  <p className="text-sm text-muted-foreground">
                    Make quick changes without leaving the page.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      defaultValue="John Doe"
                      className="col-span-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue="john@example.com"
                      className="col-span-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      toast.success(
                        "Profile updated",
                        "Your profile has been updated successfully",
                      );
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Context menu style popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40" align="end">
              <div className="grid gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal"
                  onClick={() => toast.info("Action", "Edit clicked")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal"
                  onClick={() => toast.info("Action", "Share clicked")}
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal text-red-500"
                  onClick={() => toast.info("Action", "Delete clicked")}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Popovers keep users in context while performing quick actions</p>
      </CardFooter>
    </Card>
  );
}

// Combined example component that showcases all examples
export function DialogExamplesShowcase() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Overlay Component Examples
      </h1>
      <p className="text-muted-foreground max-w-3xl mb-8">
        These examples demonstrate various overlay components for creating
        interactive user interfaces. Each component is designed for specific use
        cases and includes accessibility features.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <ConfirmationDialog />
        <AdvancedDropdownMenu />
        <TooltipExamples />
        <PopoverExamples />
      </div>
    </div>
  );
}
