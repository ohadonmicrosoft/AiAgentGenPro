import { apiClient } from "../api-client";

// Type for a prompt
export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  visibility: "private" | "team" | "public";
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isFavorite: boolean;
}

// Type for prompt creation
export interface CreatePromptDto {
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  visibility: "private" | "team" | "public";
}

// Type for prompt update
export interface UpdatePromptDto extends Partial<CreatePromptDto> {
  id: string;
}

// Fetch all prompts
export async function getPrompts(options?: {
  category?: string;
  searchQuery?: string;
  tags?: string[];
  visibility?: "private" | "team" | "public";
}) {
  // In a real app, this would call an API endpoint
  // For now, return mock data
  return Promise.resolve({
    data: {
      prompts: Array(12)
        .fill(null)
        .map((_, i) => ({
          id: `prompt-${i + 1}`,
          title: `Sample Prompt ${i + 1}`,
          description: `This is a sample prompt description ${i + 1}`,
          content: `This is the content of sample prompt ${i + 1}. It can contain variables like {{input}} and {{output}}.`,
          tags: ["sample", i % 2 === 0 ? "even" : "odd", `tag-${i}`],
          category: i % 3 === 0 ? "General" : i % 3 === 1 ? "Code" : "Writing",
          visibility: i % 3 === 0 ? "public" : i % 3 === 1 ? "team" : "private",
          author: {
            id: "user-1",
            name: "John Doe",
            avatar: `https://i.pravatar.cc/150?u=user-${i}`,
          },
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
          usageCount: Math.floor(Math.random() * 100),
          isFavorite: i % 5 === 0,
        })),
    },
  });
}

// Get a prompt by ID
export async function getPromptById(id: string) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      prompt: {
        id,
        title: `Prompt ${id}`,
        description: `This is the description for prompt ${id}`,
        content: `This is the content of prompt ${id}. It can contain variables like {{input}} and {{output}}.`,
        tags: ["sample", "example", id],
        category: "General",
        visibility: "public",
        author: {
          id: "user-1",
          name: "John Doe",
          avatar: `https://i.pravatar.cc/150?u=user-${id}`,
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        usageCount: Math.floor(Math.random() * 100),
        isFavorite: false,
      },
    },
  });
}

// Create a prompt
export async function createPrompt(data: CreatePromptDto) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      prompt: {
        id: `prompt-${Date.now()}`,
        ...data,
        author: {
          id: "user-1",
          name: "John Doe",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isFavorite: false,
      },
    },
  });
}

// Update a prompt
export async function updatePrompt(data: UpdatePromptDto) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      prompt: {
        id: data.id,
        title: data.title || `Prompt ${data.id}`,
        description:
          data.description || `This is the description for prompt ${data.id}`,
        content: data.content || `This is the content of prompt ${data.id}`,
        tags: data.tags || ["sample", "example"],
        category: data.category || "General",
        visibility: data.visibility || "public",
        author: {
          id: "user-1",
          name: "John Doe",
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: Math.floor(Math.random() * 100),
        isFavorite: false,
      },
    },
  });
}

// Delete a prompt
export async function deletePrompt(id: string) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      success: true,
    },
  });
}

// Favorite a prompt
export async function favoritePrompt(id: string) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      success: true,
    },
  });
}

// Unfavorite a prompt
export async function unfavoritePrompt(id: string) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      success: true,
    },
  });
}

// Create an agent - used by create-agent.tsx
export async function createAgent(data: any) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      agent: {
        id: `agent-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

// Update user - used by settings.tsx
export async function updateUser(data: any) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      user: {
        id: "user-1",
        ...data,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

// Delete account - used by settings.tsx
export async function deleteAccount(userId: string) {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      success: true,
    },
  });
}

// Generate API key - used by settings.tsx
export async function generateApiKey() {
  // In a real app, this would call an API endpoint
  return Promise.resolve({
    data: {
      apiKey: `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    },
  });
}
