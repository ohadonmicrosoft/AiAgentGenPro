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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MainLayout } from "@/layouts/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useScrollAnimation } from "@/hooks/animations";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart2,
  Bot,
  BookText,
  ChevronRight,
  Clock,
  Code,
  EyeIcon,
  FormInput,
  History,
  Info,
  Layout,
  LineChart,
  MessageSquare,
  Move,
  Palette,
  PieChart,
  Plus,
  ScrollText,
  Settings,
  Sparkles,
  Terminal,
  Timer,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

// Interface for Agent type
interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft";
  lastUpdated: string;
}

// Mock data for stats
const mockStats = {
  activeAgents: 4,
  savedPrompts: 12,
  totalInteractions: 231,
  deployments: 8,
};

// Mock data for agents
const mockAgents = [
  {
    id: "1",
    name: "Customer Support Bot",
    description: "Handles customer inquiries automatically with a formal response style.",
    status: "active",
    lastUpdated: "Updated 2 days ago",
  },
  {
    id: "2",
    name: "Product Recommendation",
    description: "Suggests products based on customer preferences and past purchases.",
    status: "active",
    lastUpdated: "Updated 5 days ago",
  },
  {
    id: "3",
    name: "Email Assistant",
    description: "Drafts email responses based on incoming inquiries.",
    status: "draft",
    lastUpdated: "Created 1 week ago",
  },
];

// Performance data for charts
const performanceData = [
  { name: "Mon", value: 45 },
  { name: "Tue", value: 52 },
  { name: "Wed", value: 49 },
  { name: "Thu", value: 63 },
  { name: "Fri", value: 58 },
  { name: "Sat", value: 48 },
  { name: "Sun", value: 50 },
];

// Quick action items
const quickActions = [
  { 
    label: "Create New Agent", 
    icon: <Plus className="h-5 w-5" />, 
    href: "/create-agent",
    description: "Start building a new AI agent"
  },
  { 
    label: "View All Agents", 
    icon: <Bot className="h-5 w-5" />, 
    href: "/agents",
    description: "Manage your existing agents"
  },
  { 
    label: "Prompt Library", 
    icon: <BookText className="h-5 w-5" />, 
    href: "/prompts",
    description: "Access and manage your prompts"
  },
  { 
    label: "Settings", 
    icon: <Settings className="h-5 w-5" />, 
    href: "/settings",
    description: "Configure your account preferences"
  },
];

export default function Dashboard() {
  const { ref, controls } = useScrollAnimation();
  const { user } = useAuth();
  const [animateChart, setAnimateChart] = useState(false);

  // Animation variants for staggered animations
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

  // Start chart animation when component mounts
  setTimeout(() => setAnimateChart(true), 500);

  // Fetch stats from API
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => Promise.resolve(mockStats),
    enabled: !!user,
  });

  // Fetch agents from API 
  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    queryFn: () => Promise.resolve(mockAgents),
    enabled: !!user,
  });

  // Generate performance chart path
  const generateChartPath = () => {
    const maxValue = Math.max(...performanceData.map(item => item.value));
    const height = 50;
    const width = 150;
    const xStep = width / (performanceData.length - 1);
    
    let path = `M 0 ${height - (performanceData[0].value / maxValue) * height}`;
    
    for (let i = 1; i < performanceData.length; i++) {
      const x = i * xStep;
      const y = height - (performanceData[i].value / maxValue) * height;
      path += ` L ${x} ${y}`;
    }
    
    return path;
  };

  // Quick Action Card Component
  const QuickActionCard = ({ label, icon, href, description }) => (
    <Link href={href}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-pointer group">
              <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-base group-hover:text-primary transition-colors">
                        {label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Link>
  );

  // Stats Card Component
  const StatsCard = ({ title, value, icon, trend = null }) => (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Agent Card Component
  const AgentCard = ({ agent }) => (
    <Card className="h-full hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-1">
          <CardTitle className="text-base font-bold">{agent.name}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            agent.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 
            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
          }`}>
            {agent.status === 'active' ? 'Active' : 'Draft'}
          </div>
        </div>
        <CardDescription className="text-xs mt-0">
          {agent.lastUpdated}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">
          {agent.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Link href={`/agents/${agent.id}`}>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            Edit
          </Button>
        </Link>
        <Link href={`/test-agent/${agent.id}`}>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            Test
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Welcome to the AI Agent Generator. Create, test, and manage your AI agents.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <StatsCard 
              title="Active Agents" 
              value={stats?.activeAgents || 0} 
              icon={<Bot className="h-5 w-5 text-primary" />} 
              trend={{ direction: 'up', percentage: 12 }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard 
              title="Saved Prompts" 
              value={stats?.savedPrompts || 0} 
              icon={<BookText className="h-5 w-5 text-primary" />} 
              trend={{ direction: 'up', percentage: 8 }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard 
              title="Total Interactions" 
              value={stats?.totalInteractions || 0} 
              icon={<MessageSquare className="h-5 w-5 text-primary" />} 
              trend={{ direction: 'up', percentage: 24 }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard 
              title="Deployments" 
              value={stats?.deployments || 0} 
              icon={<Zap className="h-5 w-5 text-primary" />} 
              trend={{ direction: 'up', percentage: 5 }}
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {quickActions.map((action, index) => (
                    <QuickActionCard 
                      key={index} 
                      label={action.label} 
                      icon={action.icon} 
                      href={action.href}
                      description={action.description}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Agents Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Recent Agents</CardTitle>
                  <CardDescription>Your recently created agents</CardDescription>
                </div>
                <Link href="/agents">
                  <Button variant="ghost" className="font-medium text-sm gap-1" size="sm">
                    View All 
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {agents && agents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agents.map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't created any agents yet. Get started by creating your first agent.
                    </p>
                    <Link href="/create-agent">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Agent
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Agent usage and interactions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Response Time</h4>
                    </div>
                    <span className="text-sm font-bold">625ms</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={animateChart ? { width: "72%" } : { width: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Average response time across all agents</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Uptime</h4>
                    </div>
                    <span className="text-sm font-bold">99.8%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-500"
                      initial={{ width: 0 }}
                      animate={animateChart ? { width: "98%" } : { width: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">System availability last 30 days</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PieChart className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Task Completion</h4>
                    </div>
                    <span className="text-sm font-bold">87%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-amber-500"
                      initial={{ width: 0 }}
                      animate={animateChart ? { width: "87%" } : { width: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Successfully completed tasks</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <LineChart className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Weekly Activity</h4>
                    </div>
                  </div>
                  <div className="h-[60px] relative">
                    <svg width="100%" height="100%" viewBox="0 0 150 50" preserveAspectRatio="none">
                      <motion.path
                        d={generateChartPath()}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={animateChart ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">Total interactions last 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>Improve your skills with these resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-muted/40 hover:bg-muted/60 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Prompt Engineering Guide</h3>
                        <p className="text-xs text-muted-foreground">Learn advanced techniques for crafting effective prompts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/40 hover:bg-muted/60 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <History className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">AI Agent Templates</h3>
                        <p className="text-xs text-muted-foreground">Ready-to-use templates for common use cases</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/40 hover:bg-muted/60 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Best Practices</h3>
                        <p className="text-xs text-muted-foreground">Tips and strategies for building effective AI agents</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/resources">
                <Button variant="outline" size="sm">
                  View All Resources
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
} 