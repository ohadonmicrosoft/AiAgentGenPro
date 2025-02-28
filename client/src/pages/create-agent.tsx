import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle,
  Code,
  Database,
  Loader2,
  MessageSquare,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { createAgent } from "@/lib/api";

// Define step types
type Step = "basics" | "personality" | "knowledge" | "capabilities" | "review";

// Define agent form schema
const agentSchema = z.object({
  // Basic Information
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  visibility: z.enum(["private", "team", "public"]),

  // Personality
  persona: z.string().min(20, { message: "Persona must be more detailed" }),
  tone: z.enum(["friendly", "professional", "technical", "casual", "formal"]),
  temperament: z.number().min(1).max(10),
  creativity: z.number().min(1).max(10),

  // Knowledge
  baseModel: z.enum(["gpt-4", "gpt-3.5-turbo", "claude-3", "llama-3"]),
  knowledgeSources: z.array(z.string()).optional(),
  uploadedDocuments: z.array(z.any()).optional(),
  contextWindow: z.number().min(2000).max(128000),

  // Capabilities
  webBrowsing: z.boolean().default(false),
  codeExecution: z.boolean().default(false),
  apiIntegration: z.boolean().default(false),
  imageGeneration: z.boolean().default(false),
  dataAnalysis: z.boolean().default(false),
  longTermMemory: z.boolean().default(false),
  plugins: z.array(z.string()).optional(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

// Define models options
const modelOptions = [
  { value: "gpt-4", label: "GPT-4 (Recommended)" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Faster)" },
  { value: "claude-3", label: "Claude 3 Opus" },
  { value: "llama-3", label: "Llama 3 (Open Source)" },
];

// Define tone options
const toneOptions = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
];

// Define plugin options
const pluginOptions = [
  { id: "search", label: "Web Search" },
  { id: "calculator", label: "Calculator" },
  { id: "weather", label: "Weather" },
  { id: "calendar", label: "Calendar Integration" },
  { id: "docs", label: "Document Analysis" },
  { id: "email", label: "Email Integration" },
];

export default function CreateAgentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("basics");
  const [loading, setLoading] = useState(false);

  // Initialize form with default values
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
      persona: "",
      tone: "professional",
      temperament: 5,
      creativity: 5,
      baseModel: "gpt-4",
      knowledgeSources: [],
      uploadedDocuments: [],
      contextWindow: 8000,
      webBrowsing: false,
      codeExecution: false,
      apiIntegration: false,
      imageGeneration: false,
      dataAnalysis: false,
      longTermMemory: false,
      plugins: [],
    },
  });

  // Mutation for creating an agent
  const createAgentMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: (data) => {
      toast.success("Agent created successfully!");
      navigate(`/agents/${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create agent. Please try again.");
      console.error(error);
    },
  });

  // Handle form submission
  const onSubmit = (values: AgentFormValues) => {
    createAgentMutation.mutate(values);
  };

  // Navigation functions
  const nextStep = () => {
    switch (step) {
      case "basics":
        setStep("personality");
        break;
      case "personality":
        setStep("knowledge");
        break;
      case "knowledge":
        setStep("capabilities");
        break;
      case "capabilities":
        setStep("review");
        break;
      default:
        break;
    }
  };

  const prevStep = () => {
    switch (step) {
      case "personality":
        setStep("basics");
        break;
      case "knowledge":
        setStep("personality");
        break;
      case "capabilities":
        setStep("knowledge");
        break;
      case "review":
        setStep("capabilities");
        break;
      default:
        break;
    }
  };

  // Step validation
  const validateStep = () => {
    switch (step) {
      case "basics":
        return form.trigger(["name", "description", "visibility"]);
      case "personality":
        return form.trigger(["persona", "tone", "temperament", "creativity"]);
      case "knowledge":
        return form.trigger(["baseModel", "contextWindow"]);
      case "capabilities":
        return true; // All capability fields are optional
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      nextStep();
    }
  };

  // Define steps with their icons
  const steps = [
    { id: "basics", label: "Basics", icon: <Settings className="h-5 w-5" /> },
    {
      id: "personality",
      label: "Personality",
      icon: <UserRound className="h-5 w-5" />,
    },
    {
      id: "knowledge",
      label: "Knowledge",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: "capabilities",
      label: "Capabilities",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      id: "review",
      label: "Review",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];

  return (
    <MainLayout title="Create Agent" showBackButton>
      <div className="mx-auto max-w-4xl py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create a New Agent
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure your AI agent with the perfect personality, knowledge, and
            capabilities.
          </p>
        </div>

        {/* Step indicators */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  "flex flex-col items-center space-y-2",
                  step === s.id
                    ? "text-primary"
                    : index < steps.findIndex((x) => x.id === step)
                      ? "text-primary/60"
                      : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2",
                    step === s.id
                      ? "border-primary bg-primary/10"
                      : index < steps.findIndex((x) => x.id === step)
                        ? "border-primary/60 bg-primary/5"
                        : "border-muted-foreground/30 bg-background",
                  )}
                >
                  {s.icon}
                </div>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${
                  ((steps.findIndex((s) => s.id === step) + 1) / steps.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Step */}
            {step === "basics" && (
              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Assistant" {...field} />
                        </FormControl>
                        <FormDescription>
                          A unique name for your agent.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="This agent helps with..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of what this agent does.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="private">
                              Private (Only you)
                            </SelectItem>
                            <SelectItem value="team">
                              Team (Your organization)
                            </SelectItem>
                            <SelectItem value="public">
                              Public (Everyone)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Who can access this agent.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            )}

            {/* Personality Step */}
            {step === "personality" && (
              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Agent Personality</h2>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="persona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="This agent is helpful, polite, and knowledgeable about..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe your agent's personality, character, and
                          background.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conversation Tone</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {toneOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How your agent communicates with users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="temperament"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperament (1-10)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Calm (1)</span>
                              <span>Neutral (5)</span>
                              <span>Energetic (10)</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          How lively or calm your agent responds.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creativity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creativity (1-10)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Precise (1)</span>
                              <span>Balanced (5)</span>
                              <span>Creative (10)</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          How creative or precise your agent is in its
                          responses.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            )}

            {/* Knowledge Base Step */}
            {step === "knowledge" && (
              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Knowledge Base</h2>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="baseModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base AI Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The AI model that powers your agent.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contextWindow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Context Window</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={2000}
                              max={128000}
                              step={1000}
                              defaultValue={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>2K</span>
                              <span>{field.value.toLocaleString()} tokens</span>
                              <span>128K</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          How much context your agent can process at once.
                          Larger windows increase token usage.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Knowledge Sources
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload documents or connect knowledge sources to enhance
                      your agent's knowledge.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full justify-start"
                      >
                        <span className="mr-2">+</span> Upload Documents
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full justify-start"
                      >
                        <span className="mr-2">+</span> Connect Website
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full justify-start"
                      >
                        <span className="mr-2">+</span> Connect API
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Pro features require a subscription.{" "}
                      <a
                        href="/pricing"
                        className="text-primary underline hover:no-underline"
                      >
                        Upgrade
                      </a>
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Capabilities Step */}
            {step === "capabilities" && (
              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Agent Capabilities</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="webBrowsing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Web Browsing</FormLabel>
                            <FormDescription>
                              Allow agent to search and browse the web for
                              information.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codeExecution"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Code Execution</FormLabel>
                            <FormDescription>
                              Allow agent to write and execute code in a sandbox
                              environment.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiIntegration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>API Integration</FormLabel>
                            <FormDescription>
                              Connect to APIs and external services for data.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageGeneration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Image Generation</FormLabel>
                            <FormDescription>
                              Generate images based on text descriptions.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dataAnalysis"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Data Analysis</FormLabel>
                            <FormDescription>
                              Analyze data from files and generate insights.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longTermMemory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Long-term Memory</FormLabel>
                            <FormDescription>
                              Remember past conversations across sessions.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Plugins</h3>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {pluginOptions.map((plugin) => (
                        <div
                          key={plugin.id}
                          className="flex items-center space-x-2 rounded-md border p-3"
                        >
                          <Checkbox id={plugin.id} />
                          <label
                            htmlFor={plugin.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {plugin.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Additional plugins available in the{" "}
                      <a
                        href="/marketplace"
                        className="text-primary underline hover:no-underline"
                      >
                        marketplace
                      </a>
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Review Step */}
            {step === "review" && (
              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Review & Create</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Basic Information</h3>
                    <div className="rounded-md border p-3 bg-muted/50">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Name:
                          </span>
                          <p className="font-medium">{form.getValues().name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Visibility:
                          </span>
                          <p className="font-medium capitalize">
                            {form.getValues().visibility}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-sm text-muted-foreground">
                            Description:
                          </span>
                          <p>{form.getValues().description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Personality</h3>
                    <div className="rounded-md border p-3 bg-muted/50">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <span className="text-sm text-muted-foreground">
                            Persona:
                          </span>
                          <p>{form.getValues().persona}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Tone:
                          </span>
                          <p className="font-medium capitalize">
                            {form.getValues().tone}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Temperament/Creativity:
                          </span>
                          <p className="font-medium">
                            {form.getValues().temperament}/10 -{" "}
                            {form.getValues().creativity}/10
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      Knowledge & Capabilities
                    </h3>
                    <div className="rounded-md border p-3 bg-muted/50">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Base Model:
                          </span>
                          <p className="font-medium">
                            {
                              modelOptions.find(
                                (m) => m.value === form.getValues().baseModel,
                              )?.label
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Context Window:
                          </span>
                          <p className="font-medium">
                            {form.getValues().contextWindow.toLocaleString()}{" "}
                            tokens
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-sm text-muted-foreground">
                            Capabilities:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {form.getValues().webBrowsing && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Web Browsing
                              </span>
                            )}
                            {form.getValues().codeExecution && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Code Execution
                              </span>
                            )}
                            {form.getValues().apiIntegration && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                API Integration
                              </span>
                            )}
                            {form.getValues().imageGeneration && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Image Generation
                              </span>
                            )}
                            {form.getValues().dataAnalysis && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Data Analysis
                              </span>
                            )}
                            {form.getValues().longTermMemory && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Long-term Memory
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-4 bg-primary/5">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Code className="h-4 w-4 mr-2 text-primary" />
                      Deploy & Integration
                    </h3>
                    <p className="text-sm mb-3">
                      After creating your agent, you can deploy it in various
                      ways:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                      <li>Embed on your website</li>
                      <li>API access for custom applications</li>
                      <li>Share via unique link</li>
                      <li>Mobile app integration</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === "basics"}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {step !== "review" ? (
                <Button type="button" onClick={handleNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createAgentMutation.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createAgentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Agent <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
