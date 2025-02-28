import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  BookMarked,
  Copy,
  Edit,
  Eye,
  FileText,
  Filter,
  Grid3x3,
  Link as LinkIcon,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getPrompts,
  deletePrompt,
  favoritePrompt,
  unfavoritePrompt,
} from "@/lib/api";

// Define prompt type
interface Prompt {
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

// Define view types
type ViewMode = "grid" | "list";

export default function PromptsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Query for fetching prompts
  const {
    data: allPrompts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["prompts"],
    queryFn: getPrompts,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      toast.success("Prompt deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete prompt");
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      isFavorite ? unfavoritePrompt(id) : favoritePrompt(id),
    onSuccess: (_, variables) => {
      toast.success(
        variables.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
    },
  });

  // Categories for filtering
  const categories = [
    "All",
    "Creative Writing",
    "Business",
    "Programming",
    "Education",
    "Marketing",
    "Personal",
    "Customer Support",
  ];

  // Filter and sort prompts
  const filteredPrompts = allPrompts
    .filter((prompt: Prompt) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      // Filter by category
      const matchesCategory =
        categoryFilter === "all" || prompt.category === categoryFilter;

      // Filter by visibility
      const matchesVisibility =
        visibilityFilter === "all" || prompt.visibility === visibilityFilter;

      // Filter by tab
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "my-prompts" && prompt.author.id === user?.id) ||
        (activeTab === "favorites" && prompt.isFavorite);

      return (
        matchesSearch && matchesCategory && matchesVisibility && matchesTab
      );
    })
    .sort((a: Prompt, b: Prompt) => {
      // Sort based on selected order
      switch (sortOrder) {
        case "recent":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "a-z":
          return a.title.localeCompare(b.title);
        case "z-a":
          return b.title.localeCompare(a.title);
        case "most-used":
          return b.usageCount - a.usageCount;
        default:
          return 0;
      }
    });

  // Handle toggling favorite status
  const handleToggleFavorite = (prompt: Prompt, event: React.MouseEvent) => {
    event.stopPropagation();
    favoriteMutation.mutate({ id: prompt.id, isFavorite: prompt.isFavorite });
  };

  // Handle copying prompt to clipboard
  const handleCopyPrompt = (prompt: Prompt, event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    toast.success("Prompt copied to clipboard");
  };

  // Handle delete prompt
  const handleDeletePrompt = (prompt: Prompt, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this prompt?")) {
      deleteMutation.mutate(prompt.id);
    }
  };

  // Handle opening prompt preview
  const handlePreviewPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsPreviewOpen(true);
  };

  // Format date as relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <MainLayout title="Prompt Library">
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Prompt Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse, create, and manage your prompts
            </p>
          </div>
          <Link href="/prompts/create">
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" /> Create Prompt
            </Button>
          </Link>
        </div>

        {/* Tabs and search section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Prompts</TabsTrigger>
                <TabsTrigger value="my-prompts">My Prompts</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prompts..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                title={viewMode === "grid" ? "List view" : "Grid view"}
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3x3 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem
                    key={category.toLowerCase()}
                    value={category.toLowerCase()}
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Select
              value={visibilityFilter}
              onValueChange={setVisibilityFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="a-z">A-Z</SelectItem>
                <SelectItem value="z-a">Z-A</SelectItem>
                <SelectItem value="most-used">Most Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading and error states */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full mb-4"></div>
              <p className="text-muted-foreground">Loading prompts...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center my-12">
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-medium mb-1">
                Error loading prompts
              </p>
              <p className="text-muted-foreground">Please try again later</p>
            </div>
          </div>
        )}

        {/* No results state */}
        {!isLoading && !error && filteredPrompts.length === 0 && (
          <div className="flex justify-center my-12">
            <div className="flex flex-col items-center">
              <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-1">No prompts found</p>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search or filters."
                  : "Create your first prompt to get started."}
              </p>
              <Link href="/prompts/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Prompt
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Grid view */}
        {!isLoading &&
          !error &&
          viewMode === "grid" &&
          filteredPrompts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt: Prompt) => (
                <Card
                  key={prompt.id}
                  className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handlePreviewPrompt(prompt)}
                >
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg line-clamp-1">
                        {prompt.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={(e) => handleToggleFavorite(prompt, e)}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            prompt.isFavorite && "fill-primary text-primary",
                          )}
                        />
                      </Button>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 mb-3">
                      {prompt.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <Badge
                          variant="secondary"
                          key={tag}
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {prompt.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{prompt.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 flex justify-between items-center border-t">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Badge
                        variant={
                          prompt.visibility === "public"
                            ? "default"
                            : prompt.visibility === "team"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] mr-2"
                      >
                        {prompt.visibility}
                      </Badge>
                      <span>Used {prompt.usageCount} times</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => handleCopyPrompt(prompt, e)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/prompts/${prompt.id}/edit`;
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/prompts/${prompt.id}`;
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/prompts/${prompt.id}/share`;
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-2" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => handleDeletePrompt(prompt, e)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

        {/* List view */}
        {!isLoading &&
          !error &&
          viewMode === "list" &&
          filteredPrompts.length > 0 && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrompts.map((prompt: Prompt) => (
                    <TableRow
                      key={prompt.id}
                      className="cursor-pointer"
                      onClick={() => handlePreviewPrompt(prompt)}
                    >
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 mt-0.5 text-muted-foreground hover:text-primary"
                            onClick={(e) => handleToggleFavorite(prompt, e)}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                prompt.isFavorite &&
                                  "fill-primary text-primary",
                              )}
                            />
                          </Button>
                          <div>
                            <div className="font-medium">{prompt.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {prompt.description}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prompt.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  variant="secondary"
                                  key={tag}
                                  className="text-[10px]"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  +{prompt.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{prompt.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            prompt.visibility === "public"
                              ? "default"
                              : prompt.visibility === "team"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-[10px]"
                        >
                          {prompt.visibility}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatRelativeTime(prompt.updatedAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Used {prompt.usageCount} times
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleCopyPrompt(prompt, e)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Link href={`/prompts/${prompt.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/prompts/${prompt.id}`;
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/prompts/${prompt.id}/share`;
                                }}
                              >
                                <Share2 className="h-4 w-4 mr-2" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/prompts/${prompt.id}`,
                                  );
                                  toast.success("Link copied to clipboard");
                                }}
                              >
                                <LinkIcon className="h-4 w-4 mr-2" /> Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => handleDeletePrompt(prompt, e)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

        {/* Prompt preview dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          {selectedPrompt && (
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedPrompt.title}</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() =>
                      favoriteMutation.mutate({
                        id: selectedPrompt.id,
                        isFavorite: selectedPrompt.isFavorite,
                      })
                    }
                  >
                    <Star
                      className={cn(
                        "h-5 w-5",
                        selectedPrompt.isFavorite &&
                          "fill-primary text-primary",
                      )}
                    />
                  </Button>
                </div>
                <DialogDescription className="pt-2">
                  {selectedPrompt.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.tags.map((tag) => (
                    <Badge variant="secondary" key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedPrompt.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Visibility</p>
                    <p className="font-medium capitalize">
                      {selectedPrompt.visibility}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Used</p>
                    <p className="font-medium">
                      {selectedPrompt.usageCount} times
                    </p>
                  </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/40">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Prompt Content</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPrompt.content);
                        toast.success("Prompt copied to clipboard");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 mr-2" /> Copy
                    </Button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {selectedPrompt.content}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Created by {selectedPrompt.author.name}</p>
                  <p>
                    Last updated {formatRelativeTime(selectedPrompt.updatedAt)}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <div className="flex gap-2">
                  <Link href={`/prompts/${selectedPrompt.id}/edit`}>
                    <Button variant="outline" className="gap-1.5">
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Link href={`/prompts/${selectedPrompt.id}/share`}>
                    <Button variant="outline" className="gap-1.5">
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </Link>
                </div>
                <Link href={`/prompts/${selectedPrompt.id}`}>
                  <Button>View Details</Button>
                </Link>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </MainLayout>
  );
}

// Mock data for initial development - to be replaced with API calls
(window as any).mockPrompts = [
  {
    id: "1",
    title: "Creative Story Generator",
    description:
      "Generate creative short stories based on a few keywords or themes",
    content:
      "You are a creative storyteller. Write a short story about [THEME] with a [EMOTION] mood and a surprising ending. The story should be approximately [LENGTH] paragraphs long and include vivid sensory details.",
    tags: ["creative", "storytelling", "fiction"],
    category: "creative writing",
    visibility: "public",
    author: {
      id: "user1",
      name: "Jane Smith",
    },
    createdAt: "2023-11-15T10:20:00Z",
    updatedAt: "2023-12-05T14:30:00Z",
    usageCount: 324,
    isFavorite: true,
  },
  {
    id: "2",
    title: "Code Review Assistant",
    description:
      "Helps review code and suggest improvements for better quality and performance",
    content:
      "You are a senior software engineer specializing in [LANGUAGE]. Review the following code and suggest improvements for: 1) Performance optimizations, 2) Better readability, 3) Potential bugs, 4) Security vulnerabilities. Be specific and explain why each change is recommended.\n\nCode to review:\n```\n[CODE]\n```",
    tags: ["programming", "code-review", "best-practices"],
    category: "programming",
    visibility: "team",
    author: {
      id: "user2",
      name: "Alex Johnson",
    },
    createdAt: "2023-10-20T08:15:00Z",
    updatedAt: "2023-10-22T11:45:00Z",
    usageCount: 178,
    isFavorite: false,
  },
  {
    id: "3",
    title: "Email Response Generator",
    description:
      "Generates professional email responses for various business situations",
    content:
      "Draft a professional email response for a [SITUATION] with a [TONE] tone. The email should address [KEY_POINTS] and include a clear call to action. Keep it concise but comprehensive, maintaining a professional business style throughout.",
    tags: ["business", "email", "professional"],
    category: "business",
    visibility: "private",
    author: {
      id: "user1",
      name: "Jane Smith",
    },
    createdAt: "2023-09-10T15:20:00Z",
    updatedAt: "2023-09-10T15:20:00Z",
    usageCount: 42,
    isFavorite: true,
  },
  {
    id: "4",
    title: "Product Description Writer",
    description:
      "Creates compelling product descriptions for e-commerce websites",
    content:
      "Write a persuasive product description for [PRODUCT_NAME], which is a [PRODUCT_TYPE]. The target audience is [TARGET_AUDIENCE]. Highlight the following features and benefits: [FEATURES_BENEFITS]. The description should be approximately [LENGTH] words and include SEO-friendly keywords while maintaining an engaging tone.",
    tags: ["marketing", "e-commerce", "copywriting"],
    category: "marketing",
    visibility: "public",
    author: {
      id: "user3",
      name: "Michael Brown",
    },
    createdAt: "2023-08-25T09:30:00Z",
    updatedAt: "2023-09-05T14:20:00Z",
    usageCount: 256,
    isFavorite: false,
  },
  {
    id: "5",
    title: "Learning Guide Creator",
    description:
      "Creates structured learning guides on any topic with examples and exercises",
    content:
      "Create a comprehensive learning guide for [TOPIC] aimed at [SKILL_LEVEL] learners. The guide should include: 1) An introduction explaining the importance of this topic, 2) Key concepts explained in simple terms, 3) Step-by-step tutorials for practical application, 4) Common mistakes to avoid, 5) Exercises for practice, and 6) Resources for further learning. Use examples throughout to illustrate the concepts.",
    tags: ["education", "tutorial", "learning"],
    category: "education",
    visibility: "public",
    author: {
      id: "user4",
      name: "Sarah Wilson",
    },
    createdAt: "2023-07-12T11:20:00Z",
    updatedAt: "2023-08-18T16:45:00Z",
    usageCount: 489,
    isFavorite: true,
  },
  {
    id: "6",
    title: "Customer Support Reply Template",
    description:
      "Template for responding to customer support inquiries efficiently",
    content:
      "As a customer support representative for [COMPANY_NAME], respond to the following customer inquiry about [ISSUE_TYPE]. Your response should: 1) Acknowledge the customer's concern, 2) Provide a clear explanation or solution, 3) Include any necessary steps the customer needs to take, 4) Offer additional assistance if needed, and 5) End with an appropriate closing. Maintain a [TONE] tone throughout.\n\nCustomer inquiry: [CUSTOMER_MESSAGE]",
    tags: ["customer-support", "template", "service"],
    category: "customer support",
    visibility: "team",
    author: {
      id: "user2",
      name: "Alex Johnson",
    },
    createdAt: "2023-06-30T13:45:00Z",
    updatedAt: "2023-07-15T10:30:00Z",
    usageCount: 621,
    isFavorite: false,
  },
];
