import { Button } from "@/components/ui/button";
import { FocusTrap } from "@/components/ui/focus-trap";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAnnouncer } from "@/lib/accessibility";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  Bot,
  ChevronLeft,
  Compass,
  Database,
  Home,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Users,
  X,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// Interface for navigation items
interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  matches?: string[];
}

// Props for the MainLayout component
interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  fullWidth?: boolean;
}

// Create context for sidebar state management
type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isHovering: boolean;
  setIsHovering: (isHovering: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: () => {},
  isCollapsed: false,
  setIsCollapsed: () => {},
  isHovering: false,
  setIsHovering: () => {},
});

// Hook to use sidebar context
export const useSidebar = () => useContext(SidebarContext);

// Define navigation items
const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <Home className="h-5 w-5" />,
    matches: ["/", "/dashboard"],
  },
  {
    label: "Agents",
    path: "/agents",
    icon: <Bot className="h-5 w-5" />,
    matches: ["/agents", "/create-agent", "/agents/*", "/test-agent/*"],
  },
  {
    label: "Prompts",
    path: "/prompts",
    icon: <MessageSquare className="h-5 w-5" />,
    matches: ["/prompts", "/prompts/*"],
  },
  {
    label: "Explore",
    path: "/explore",
    icon: <Compass className="h-5 w-5" />,
    matches: ["/explore", "/explore/*"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
    matches: ["/settings", "/settings/*"],
  },
];

// Define admin navigation items
const adminNavItems: NavItem[] = [
  {
    label: "Users",
    path: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    matches: ["/admin/users", "/admin/users/*"],
  },
  {
    label: "System",
    path: "/admin/system",
    icon: <Database className="h-5 w-5" />,
    matches: ["/admin/system", "/admin/system/*"],
  },
];

// Sidebar Component
const Sidebar = () => {
  const [location] = useLocation();
  const { isCollapsed, isHovering, isOpen, setIsOpen } = useSidebar();
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Check if the current location matches any of the item's paths
  const isActive = (item: NavItem) => {
    return (
      item.path === location ||
      item.matches?.some((match) => {
        if (match.endsWith("/*")) {
          const basePath = match.replace("/*", "");
          return location.startsWith(basePath);
        }
        return match === location;
      })
    );
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // Set initial theme based on user preference or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed && !isHovering
          ? "w-[70px]"
          : isOpen
          ? "w-[240px]"
          : "w-0 md:w-[240px]"
      )}
    >
      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <div className="p-1 mr-2 bg-primary/10 rounded-md">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h1
            className={cn(
              "text-lg font-bold transition-opacity duration-200",
              isCollapsed && !isHovering ? "hidden" : "block"
            )}
          >
            AI Agent
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive(item) ? "page" : undefined}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span
                    className={cn(
                      "transition-opacity duration-200",
                      isCollapsed && !isHovering ? "hidden" : "block"
                    )}
                  >
                    {item.label}
                  </span>
                </a>
              </Link>
            </li>
          ))}
        </ul>

        {/* Admin section if user has admin role */}
        {user?.role === "admin" && (
          <>
            <div
              className={cn(
                "mt-6 mb-2 px-4 text-xs font-semibold text-muted-foreground",
                isCollapsed && !isHovering ? "hidden" : "block"
              )}
            >
              Admin
            </div>
            <ul className="space-y-1 px-2">
              {adminNavItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      aria-current={isActive(item) ? "page" : undefined}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span
                        className={cn(
                          "transition-opacity duration-200",
                          isCollapsed && !isHovering ? "hidden" : "block"
                        )}
                      >
                        {item.label}
                      </span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Sidebar footer */}
      <div className="border-t p-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(isCollapsed && !isHovering ? "hidden" : "block")}
            onClick={() => setIsOpen(false)}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// TopNav Component
const TopNav = ({ title, showBackButton = false }) => {
  const { isOpen, setIsOpen } = useSidebar();
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Back button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Page title */}
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Search button */}
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications button */}
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User profile */}
          {user && (
            <div className="relative flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role || "User"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Main Layout Component
export function MainLayout({
  children,
  title = "AI Agent Generator",
  showBackButton = false,
  fullWidth = false,
}: MainLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { announce } = useAnnouncer();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isOpen &&
        !(event.target as Element).closest(".sidebar")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isOpen]);

  // Prevent scrolling on body when mobile sidebar is open
  useEffect(() => {
    if (isMobile) {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  // Announce sidebar state changes for accessibility
  useEffect(() => {
    if (isOpen) {
      announce("Navigation sidebar opened");
    } else if (!isOpen && !isCollapsed) {
      announce("Navigation sidebar closed");
    }
  }, [isOpen, isCollapsed, announce]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isCollapsed,
        setIsCollapsed,
        isHovering,
        setIsHovering,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
        >
          Skip to content
        </a>

        {/* Mobile overlay */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <FocusTrap active={isMobile && isOpen}>
          <div className="sidebar">
            <Sidebar />
          </div>
        </FocusTrap>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav title={title} showBackButton={showBackButton} />

          {/* Main content */}
          <main
            id="main-content"
            className={cn(
              "flex-1 overflow-y-auto p-4 md:p-6",
              fullWidth ? "max-w-full" : "mx-auto max-w-7xl"
            )}
          >
            <ErrorBoundary
              fallback={
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
                  <h2 className="mb-2 text-2xl font-semibold">
                    Something went wrong
                  </h2>
                  <p className="mb-4 text-muted-foreground">
                    An error occurred while loading this page content.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-primary text-primary-foreground"
                  >
                    Try again
                  </Button>
                </div>
              }
            >
              {/* Animated page entry */}
              <div className="animate-in fade-in duration-500">{children}</div>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
} 