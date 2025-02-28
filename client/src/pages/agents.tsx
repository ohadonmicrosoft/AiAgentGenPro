import React, { useState } from "react";
import { PlusCircle, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Basic agent type definition
interface Agent {
  id: string;
  name: string;
  description: string;
  type: "chat" | "task" | "assistant";
  status: "active" | "inactive" | "draft";
  createdAt: Date;
  lastUsed?: Date;
}

// Example data for the demo
const DEMO_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Customer Support Agent",
    description: "Handles customer inquiries and support tickets",
    type: "chat",
    status: "active",
    createdAt: new Date("2023-12-15"),
    lastUsed: new Date("2024-02-28"),
  },
  {
    id: "2",
    name: "Research Assistant",
    description: "Helps with gathering and summarizing information",
    type: "assistant",
    status: "active",
    createdAt: new Date("2024-01-22"),
    lastUsed: new Date("2024-02-25"),
  },
  {
    id: "3",
    name: "Code Reviewer",
    description: "Reviews code and suggests improvements",
    type: "task",
    status: "draft",
    createdAt: new Date("2024-02-10"),
  },
];

// Agent card component
function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="flex flex-col p-4 transition-all border rounded-lg shadow-sm bg-card hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold">{agent.name}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            agent.status === "active"
              ? "bg-green-100 text-green-800"
              : agent.status === "draft"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {agent.status}
        </span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{agent.description}</p>
      <div className="flex items-center mt-auto text-xs text-muted-foreground">
        <span>Type: {agent.type}</span>
        <span className="mx-2">•</span>
        <span>Created: {agent.createdAt.toLocaleDateString()}</span>
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm" variant="default">
          Use
        </Button>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  // Filter agents based on search and tab
  const filteredAgents = DEMO_AGENTS.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (currentTab === "all") return matchesSearch;
    if (currentTab === "active")
      return matchesSearch && agent.status === "active";
    if (currentTab === "draft")
      return matchesSearch && agent.status === "draft";
    if (currentTab === "chat") return matchesSearch && agent.type === "chat";
    if (currentTab === "task") return matchesSearch && agent.type === "task";
    if (currentTab === "assistant")
      return matchesSearch && agent.type === "assistant";

    return false;
  });

  return (
    <div className="container py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <Button onClick={() => setShowNewAgentModal(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          New Agent
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="all"
          className="w-full md:w-auto"
          onValueChange={setCurrentTab}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="task">Task</TabsTrigger>
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredAgents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <p className="mb-4 text-lg font-medium text-center">
            No agents found
          </p>
          <p className="mb-6 text-center text-muted-foreground">
            {searchQuery
              ? "Try changing your search query or filters"
              : "Create your first agent to get started"}
          </p>
          <Button onClick={() => setShowNewAgentModal(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
      )}

      {/* New Agent Modal */}
      <Dialog open={showNewAgentModal} onOpenChange={setShowNewAgentModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              This is a placeholder for the new agent creation form. In a real
              application, this would contain a form with fields for name,
              description, type, etc.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNewAgentModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowNewAgentModal(false)}>
              Create Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
