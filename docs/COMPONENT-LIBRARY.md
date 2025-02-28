# Component Library Documentation

This document provides a comprehensive guide to the UI components available in our restructured project. Each component is designed with accessibility, reusability, and consistency in mind.

## Table of Contents

1. [Basic Components](#basic-components)

   - [Button](#button)
   - [Card](#card)
   - [Input](#input)
   - [Label](#label)
   - [Checkbox](#checkbox)
   - [RadioGroup](#radiogroup)
   - [Select](#select)
   - [Slider](#slider)
   - [Textarea](#textarea)

2. [Layout Components](#layout-components)

   - [MainLayout](#mainlayout)
   - [Container](#container)
   - [Grid](#grid)
   - [Flex](#flex)

3. [Feedback Components](#feedback-components)

   - [Alert](#alert)
   - [Toast](#toast)
   - [Progress](#progress)
   - [Skeleton](#skeleton)

4. [Overlay Components](#overlay-components)

   - [AlertDialog](#alertdialog)
   - [Dialog](#dialog)
   - [Drawer](#drawer)
   - [Popover](#popover)
   - [Tooltip](#tooltip)
   - [DropdownMenu](#dropdownmenu)

5. [Navigation Components](#navigation-components)

   - [Tabs](#tabs)
   - [Accordion](#accordion)
   - [Breadcrumb](#breadcrumb)
   - [Pagination](#pagination)

6. [Data Display Components](#data-display-components)

   - [Table](#table)
   - [VirtualizedList](#virtualizedlist)
   - [Badge](#badge)
   - [Avatar](#avatar)

7. [Forms](#forms)

   - [Form](#form)
   - [FormField](#formfield)
   - [FormItem](#formitem)
   - [FormLabel](#formlabel)
   - [FormMessage](#formmessage)

8. [Utility Components](#utility-components)
   - [ErrorBoundary](#errorboundary)
   - [FocusTrap](#focustrap)

## Basic Components

### Button

The Button component is used to trigger actions. It supports different variants, sizes, and can be disabled.

```tsx
import { Button } from "@/components/ui/button";

<Button>Default Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="destructive">Destructive Button</Button>
<Button size="sm">Small Button</Button>
<Button size="lg">Large Button</Button>
<Button disabled>Disabled Button</Button>
<Button asChild><a href="/home">Link Button</a></Button>
```

#### Props

| Prop      | Type                                                                          | Default     | Description                            |
| --------- | ----------------------------------------------------------------------------- | ----------- | -------------------------------------- |
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | Button style variant                   |
| `size`    | `"default" \| "sm" \| "lg" \| "icon"`                                         | `"default"` | Button size                            |
| `asChild` | `boolean`                                                                     | `false`     | Whether to render as a child component |

### Card

The Card component is used to group related information in a container with a header, content, and footer.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Checkbox

The Checkbox component allows users to select multiple items from a set.

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label
    htmlFor="terms"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Accept terms and conditions
  </label>
</div>;
```

#### Props

| Prop              | Type                         | Default | Description                         |
| ----------------- | ---------------------------- | ------- | ----------------------------------- |
| `checked`         | `boolean`                    | -       | Whether the checkbox is checked     |
| `onCheckedChange` | `(checked: boolean) => void` | -       | Callback when checked state changes |
| `disabled`        | `boolean`                    | `false` | Whether the checkbox is disabled    |

### RadioGroup

The RadioGroup component allows users to select one option from a set.

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <label htmlFor="option-one">Option One</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <label htmlFor="option-two">Option Two</label>
  </div>
</RadioGroup>;
```

#### Props

| Prop            | Type                      | Default | Description                          |
| --------------- | ------------------------- | ------- | ------------------------------------ |
| `value`         | `string`                  | -       | The value of the selected radio item |
| `onValueChange` | `(value: string) => void` | -       | Callback when the value changes      |
| `defaultValue`  | `string`                  | -       | The default value                    |
| `disabled`      | `boolean`                 | `false` | Whether the radio group is disabled  |

### Select

The Select component provides a dropdown list of options for users to choose from.

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option-one">Option One</SelectItem>
    <SelectItem value="option-two">Option Two</SelectItem>
    <SelectItem value="option-three">Option Three</SelectItem>
  </SelectContent>
</Select>;
```

#### Props

| Component    | Prop            | Type                      | Default | Description                                |
| ------------ | --------------- | ------------------------- | ------- | ------------------------------------------ |
| `Select`     | `value`         | `string`                  | -       | The controlled value                       |
| `Select`     | `defaultValue`  | `string`                  | -       | The default value                          |
| `Select`     | `onValueChange` | `(value: string) => void` | -       | Callback when value changes                |
| `Select`     | `disabled`      | `boolean`                 | `false` | Whether the select is disabled             |
| `SelectItem` | `value`         | `string`                  | -       | The value of the item                      |
| `SelectItem` | `disabled`      | `boolean`                 | `false` | Whether the item is disabled               |
| `SelectItem` | `withCheckIcon` | `boolean`                 | `true`  | Whether to show a check icon when selected |

### Slider

The Slider component allows users to select a value or range from a specified range of values.

```tsx
import { Slider } from "@/components/ui/slider";

<Slider defaultValue={[50]} max={100} step={1} />;
```

#### Props

| Prop            | Type                        | Default | Description                    |
| --------------- | --------------------------- | ------- | ------------------------------ |
| `defaultValue`  | `number[]`                  | -       | The default value(s)           |
| `value`         | `number[]`                  | -       | The controlled value(s)        |
| `onValueChange` | `(value: number[]) => void` | -       | Callback when value changes    |
| `min`           | `number`                    | `0`     | The minimum value              |
| `max`           | `number`                    | `100`   | The maximum value              |
| `step`          | `number`                    | `1`     | The step increment             |
| `disabled`      | `boolean`                   | `false` | Whether the slider is disabled |

## Overlay Components

### AlertDialog

The AlertDialog component is used to interrupt the user with a modal dialog for important content.

```tsx
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

### Popover

The Popover component displays a popup that contains additional information or controls.

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Popover Content</h4>
        <p className="text-sm text-muted-foreground">
          This is some content inside the popover.
        </p>
      </div>
    </div>
  </PopoverContent>
</Popover>;
```

#### Props

| Component        | Prop           | Type                           | Default    | Description                             |
| ---------------- | -------------- | ------------------------------ | ---------- | --------------------------------------- |
| `Popover`        | `open`         | `boolean`                      | -          | Whether the popover is open             |
| `Popover`        | `onOpenChange` | `(open: boolean) => void`      | -          | Callback when open state changes        |
| `PopoverTrigger` | `asChild`      | `boolean`                      | `false`    | Whether to render as a child component  |
| `PopoverContent` | `align`        | `"center" \| "start" \| "end"` | `"center"` | Alignment of the popover                |
| `PopoverContent` | `sideOffset`   | `number`                       | `4`        | Gap between the popover and the trigger |

### Tooltip

The Tooltip component displays informative text when a user hovers over an element.

```tsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover Me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>;
```

#### Props

| Component        | Prop           | Type                      | Default | Description                             |
| ---------------- | -------------- | ------------------------- | ------- | --------------------------------------- |
| `Tooltip`        | `open`         | `boolean`                 | -       | Whether the tooltip is open             |
| `Tooltip`        | `onOpenChange` | `(open: boolean) => void` | -       | Callback when open state changes        |
| `TooltipTrigger` | `asChild`      | `boolean`                 | `false` | Whether to render as a child component  |
| `TooltipContent` | `sideOffset`   | `number`                  | `4`     | Gap between the tooltip and the trigger |

### DropdownMenu

The DropdownMenu component displays a menu when a trigger element is clicked.

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

## Feedback Components

### Toast

The Toast component displays brief, temporary notifications.

```tsx
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

// Add the Toaster component to your layout
<Toaster />

// In your component
const { toast } = useToast();

// Show a toast
<Button
  onClick={() => {
    toast({
      title: "Scheduled",
      description: "Your appointment has been scheduled.",
    });
  }}
>
  Show Toast
</Button>

// Different toast variants
<Button onClick={() => toast.success("Success", "Operation completed successfully")}>
  Success Toast
</Button>

<Button onClick={() => toast.error("Error", "Something went wrong")}>
  Error Toast
</Button>

<Button onClick={() => toast.warning("Warning", "Proceed with caution")}>
  Warning Toast
</Button>

<Button onClick={() => toast.info("Info", "Just an FYI")}>
  Info Toast
</Button>
```

## Forms

### Form

The Form component integrates with React Hook Form for building forms with validation.

```tsx
import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define your form schema
const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});

export function ProfileForm() {
  // Initialize form with our custom hook
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      username: "",
      email: "",
    },
    onSubmit: (values) => {
      console.log(values);
    },
    toast: {
      success: {
        title: "Profile saved",
        description: "Your profile has been updated",
      },
      error: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.submitHandler} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
```

## Hooks

### useToast

The `useToast` hook provides an interface for displaying toast notifications.

```tsx
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleAction = () => {
    // Basic toast
    toast({
      title: "Title",
      description: "Description",
    });

    // Success toast
    toast.success("Success", "Operation completed successfully");

    // Error toast
    toast.error("Error", "Something went wrong");

    // Warning toast
    toast.warning("Warning", "This could be dangerous");

    // Info toast
    toast.info("Info", "Here's something you should know");

    // With an action
    toast({
      title: "Action needed",
      description: "You need to do something",
      action: (
        <ToastAction
          altText="Do it"
          onClick={() => console.log("Action clicked")}
        >
          Do it
        </ToastAction>
      ),
    });

    // Dismiss a toast programmatically
    const toastId = toast({ title: "Dismissable" });
    setTimeout(() => toast.dismiss(toastId), 2000);

    // Promise toast
    toast.promise(fetch("/api/data"), {
      loading: "Loading...",
      success: "Data loaded successfully",
      error: "Error loading data",
    });
  };

  return <Button onClick={handleAction}>Show Toast</Button>;
}
```

### useMutation

The `useMutation` hook extends React Query's useMutation with toast notifications and error handling.

```tsx
import { useMutation } from "@/hooks/use-mutation";
import { apiClient } from "@/lib/api-client";

function CreateUserForm() {
  const mutation = useMutation({
    mutationFn: (userData) => apiClient.users.create(userData),
    toast: {
      success: {
        title: "User created",
        description: "User has been created successfully",
      },
      error: true,
      loading: { title: "Creating user", description: "Please wait..." },
    },
    errorHandling: {
      retry: 1,
      formatError: (error) => ({
        title: "Error creating user",
        description: error.message,
      }),
    },
    options: {
      onSuccess: (data) => {
        console.log("User created:", data);
      },
    },
  });

  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button disabled={mutation.isSubmitting}>
        {mutation.isSubmitting ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
```

### useForm

The `useForm` hook extends React Hook Form with Zod validation and toast notifications.

```tsx
import { z } from "zod";
import { useForm } from "@/hooks/use-form";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

function MyForm() {
  const form = useForm({
    schema,
    defaultValues: {
      name: "",
      email: "",
    },
    onSubmit: async (values) => {
      await saveUserData(values);
    },
    toast: {
      success: { title: "Success", description: "Form submitted successfully" },
      error: true,
    },
  });

  return (
    <form onSubmit={form.submitHandler}>
      {/* Form fields */}
      <Button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
```

### useAuth

The `useAuth` hook provides authentication functionality.

```tsx
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
  } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn("user@example.com", "password");
      // Navigate to dashboard
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp("user@example.com", "password", "John Doe");
      // Navigate to dashboard
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : isAuthenticated ? (
        <>
          <p>Welcome, {user?.name || user?.email}</p>
          <Button onClick={signOut}>Sign Out</Button>
        </>
      ) : (
        <>
          <Button onClick={handleSignIn}>Sign In</Button>
          <Button onClick={handleSignUp}>Sign Up</Button>
        </>
      )}
    </div>
  );
}
```

## API Utilities

### apiClient

The `apiClient` provides a typed interface for making API calls.

```tsx
import { apiClient } from "@/lib/api-client";

// Authentication
async function login(email: string, password: string) {
  try {
    const response = await apiClient.auth.login({ email, password });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

// Agents
async function getAgents() {
  try {
    const response = await apiClient.agents.getAll({ limit: 10 });
    return response.data.agents;
  } catch (error) {
    console.error("Failed to get agents:", error);
    throw error;
  }
}

// Prompts
async function createPrompt(prompt: any) {
  try {
    const response = await apiClient.prompts.create(prompt);
    return response.data.prompt;
  } catch (error) {
    console.error("Failed to create prompt:", error);
    throw error;
  }
}

// Users
async function updateUserProfile(profile: any) {
  try {
    const response = await apiClient.users.updateProfile(profile);
    return response.data.user;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}

// Uploads
async function uploadFile(file: File) {
  try {
    const response = await apiClient.uploads.upload(file);
    return response.data;
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
}

// API Keys
async function generateApiKey(name: string) {
  try {
    const response = await apiClient.apiKeys.create(name);
    return response.data.apiKey;
  } catch (error) {
    console.error("Failed to generate API key:", error);
    throw error;
  }
}

// Stats
async function getDashboardStats() {
  try {
    const response = await apiClient.stats.getDashboardStats();
    return response.data.stats;
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    throw error;
  }
}
```

## Conclusion

This documentation provides an overview of the core components available in our UI library. All components are built with accessibility in mind and follow a consistent design pattern. Use these components to build consistent, accessible, and beautiful user interfaces.

For more details on specific components, refer to the implementation in the codebase or reach out to the development team.
