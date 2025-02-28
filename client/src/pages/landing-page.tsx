import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Bot,
  ArrowRight,
  Check,
  BarChart,
  MessageSquare,
  Brain,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";

// Login schema with validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration schema with validation and password matching
const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

// Features section data
const features = [
  {
    title: "Intuitive Agent Builder",
    description:
      "Build AI agents with a user-friendly drag-and-drop interface. No coding required.",
    icon: <Bot className="h-10 w-10 text-primary" />,
  },
  {
    title: "Advanced Analytics",
    description:
      "Track agent performance with detailed analytics and real-time metrics.",
    icon: <BarChart className="h-10 w-10 text-primary" />,
  },
  {
    title: "Prompt Library",
    description:
      "Access a rich library of pre-built prompts to accelerate your AI development.",
    icon: <MessageSquare className="h-10 w-10 text-primary" />,
  },
  {
    title: "Intelligent Optimization",
    description:
      "Built-in tools to refine and optimize your agents automatically.",
    icon: <Brain className="h-10 w-10 text-primary" />,
  },
];

// Benefits section data
const benefits = [
  "Create complex AI agents without coding knowledge",
  "Deploy agents across multiple platforms seamlessly",
  "Understand performance with comprehensive analytics",
  "Integrate with your existing tools and workflows",
  "Scale effortlessly as your needs grow",
  "Rapid iteration and testing capabilities",
];

// Testimonials data
const testimonials = [
  {
    quote:
      "This tool has revolutionized how our support team operates. We've automated 70% of routine inquiries.",
    author: "Sarah J., Customer Support Manager",
    company: "TechCorp Inc.",
  },
  {
    quote:
      "The agent builder is intuitive enough for non-technical team members while being powerful enough for our developers.",
    author: "Michael T., CTO",
    company: "Innovate Solutions",
  },
  {
    quote:
      "We've seen a 45% increase in customer satisfaction after deploying agents built with this platform.",
    author: "Laura M., Customer Experience Director",
    company: "Global Retail",
  },
];

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Form setup for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form setup for registration
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  // Handle registration form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword as it's not needed for the API
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <header className="py-6 px-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">AI Agent Generator</h1>
          </div>
          <a href="#auth" className="hidden sm:block">
            <Button variant="outline" className="rounded-full">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Build Powerful AI Agents{" "}
                <span className="text-primary">Without Code</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Design, test, and deploy intelligent AI agents in minutes.
                Streamline customer support, automate tasks, and enhance user
                experiences.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="#auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold mb-4"
              >
                Powerful Features
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Everything you need to create, deploy, and manage intelligent AI
                agents
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 p-2 bg-primary/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex-1"
              >
                <h2 className="text-3xl font-bold mb-6">
                  Why Choose Our Platform?
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 p-1 bg-primary/10 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex-1"
              >
                <div className="bg-muted rounded-lg p-1">
                  <div className="bg-card rounded-md shadow-sm p-6 relative">
                    <div className="absolute -top-3 -left-3 p-2 bg-primary rounded-md">
                      <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="pt-6">
                      {/* Placeholder for platform screenshot or illustration */}
                      <div className="w-full h-64 bg-muted/30 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Platform Interface
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold mb-4"
              >
                What Our Users Say
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Join hundreds of companies already using our platform
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="italic mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Auth Section */}
        <section id="auth" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Get Started Today</h2>
                <p className="text-muted-foreground">
                  Create an account or login to start building AI agents
                </p>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome Back</CardTitle>
                      <CardDescription>
                        Enter your credentials to access your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form
                          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your username"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending
                              ? "Logging in..."
                              : "Login"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <div className="text-xs text-muted-foreground text-center w-full mb-1">
                        Developer Quick Login
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          onClick={() => {
                            loginForm.setValue("username", "developer");
                            loginForm.setValue("password", "developer123");
                            loginForm.handleSubmit(onLoginSubmit)();
                          }}
                        >
                          Dev Login
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          onClick={async () => {
                            try {
                              const response = await fetch("/api/devlogin", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                credentials: "include",
                              });

                              if (response.ok) {
                                window.location.href = "/"; // Force reload to update auth state
                              }
                            } catch (error) {
                              console.error("Dev quick login failed:", error);
                            }
                          }}
                        >
                          Quick Login
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an account</CardTitle>
                      <CardDescription>
                        Enter your details to create a new account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form
                          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Choose a username"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Choose a password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Confirm your password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending
                              ? "Creating account..."
                              : "Register"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">AI Agent Generator</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Agent Generator. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
