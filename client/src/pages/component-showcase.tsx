import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm, PreferencesForm, ApiKeyForm, SettingsForm } from "@/components/examples/form-examples";
import { DialogExamplesShowcase, ConfirmationDialog, AdvancedDropdownMenu, TooltipExamples, PopoverExamples } from "@/components/examples/dialog-examples";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function ComponentShowcase() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Component Library Showcase</h1>
          <p className="text-muted-foreground mt-1">
            A demonstration of the UI components available in our library
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm font-normal">v1.0.0</Badge>
          <Button 
            size="sm" 
            onClick={() => toast({
              title: "Component Library",
              description: "Documentation available at /docs/COMPONENT-LIBRARY.md"
            })}
          >
            View Documentation
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="overview" 
        className="mt-8"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs & Overlays</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Components</CardTitle>
                <CardDescription>Examples of form components and validation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Includes Input, Checkbox, RadioGroup, Select, and other form controls with validation using Zod and React Hook Form.
                </p>
                <Button
                  onClick={() => setActiveTab("forms")}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  View Examples
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dialogs & Overlays</CardTitle>
                <CardDescription>Modal dialogs, tooltips, and popovers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interactive components for displaying additional content and user interactions such as alerts, tooltips, and dropdown menus.
                </p>
                <Button
                  onClick={() => setActiveTab("dialogs")}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  View Examples
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Display</CardTitle>
                <CardDescription>Tables, cards, and data visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Components for displaying data in organized formats including tables, cards, badges, and more.
                </p>
                <Button
                  onClick={() => setActiveTab("data")}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  View Examples
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Components</CardTitle>
                <CardDescription>Grid, containers, and layout utilities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Components for creating responsive layouts including grids, containers, and flex utilities.
                </p>
                <Button
                  onClick={() => setActiveTab("layout")}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  View Examples
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hooks</CardTitle>
                <CardDescription>Custom React hooks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Utility hooks for common tasks like form handling, API interactions, toast notifications, and more.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.info("Hooks", "Hooks documentation available in COMPONENT-LIBRARY.md")}
                  >
                    Read Docs
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("forms")}
                  >
                    See Usage
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
                <CardDescription>API client and utilities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Utilities for interacting with APIs, including the apiClient, useMutation, and query hooks.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.info("API", "API client documentation available in COMPONENT-LIBRARY.md")}
                  >
                    Read Docs
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("forms")}
                  >
                    See Usage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This showcase demonstrates the components available in our UI library. All components are built with accessibility, 
              consistency, and ease of use in mind. The examples in this showcase demonstrate real-world usage patterns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md bg-muted p-4">
                <h4 className="text-sm font-medium mb-2">Component Usage</h4>
                <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                  {`import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Example() {
  return (
    <form>
      <Input placeholder="Email" />
      <Button>Submit</Button>
    </form>
  );
}`}
                </pre>
              </div>
              <div className="rounded-md bg-muted p-4">
                <h4 className="text-sm font-medium mb-2">Hooks Usage</h4>
                <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                  {`import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@/hooks/use-mutation";

export function Example() {
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: (data) => api.post("/endpoint", data),
    toast: {
      success: { title: "Success!" },
      error: true
    }
  });

  return (
    <Button onClick={() => toast.success("Hello!")}>
      Show Toast
    </Button>
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Form Examples</h2>
          <p className="text-muted-foreground max-w-3xl mb-6">
            These form examples demonstrate how to use our form components with validation, error handling, and 
            submission processing. Each form utilizes our custom hooks for a consistent API.
          </p>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Form</h3>
              <ContactForm />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
              <PreferencesForm />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">API Key Generation</h3>
              <ApiKeyForm />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Settings Form</h3>
              <SettingsForm />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dialogs">
          <DialogExamplesShowcase />
        </TabsContent>

        <TabsContent value="data" className="py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Data Display Components</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              These examples are in development. Check back soon to see data display components such as
              tables, virtualized lists, and data visualizations.
            </p>
            <Button 
              variant="outline"
              onClick={() => toast({
                title: "Coming Soon",
                description: "Data display examples are currently in development"
              })}
            >
              Notify Me When Ready
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Layout Components</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              These examples are in development. Check back soon to see layout components such as
              containers, grids, and responsive helpers.
            </p>
            <Button 
              variant="outline"
              onClick={() => toast({
                title: "Coming Soon",
                description: "Layout component examples are currently in development"
              })}
            >
              Notify Me When Ready
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 