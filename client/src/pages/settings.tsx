import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertTriangle,
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Key,
  Loader2,
  Lock,
  Moon,
  Palette,
  Plus,
  Save,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { updateUser, deleteAccount, generateApiKey } from "@/lib/api";

const apiKeyMockData = [
  {
    id: "key_1",
    name: "Development",
    key: "sk_dev_2x4C7Hhj9K3L5M8N1P2Q3R4S5T6U7V8W",
    createdAt: "2023-08-15T10:30:00Z",
    lastUsed: "2023-09-25T14:45:00Z",
  },
  {
    id: "key_2",
    name: "Production",
    key: "sk_prod_9A8B7C6D5E4F3G2H1I2J3K4L5M6N7O8P",
    createdAt: "2023-09-01T08:20:00Z",
    lastUsed: "2023-09-26T09:15:00Z",
  }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [apiKeys, setApiKeys] = useState(apiKeyMockData);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">("system");
  const [showPassword, setShowPassword] = useState(false);
  const [keyBeingCreated, setKeyBeingCreated] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    modelPreference: "gpt-4",
    language: "en",
    emailNotifications: {
      updates: true,
      tips: true,
      usage: true,
      security: true,
    }
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (passwords: any) => updateUser({ ...passwords, type: "password" }),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    },
    onError: () => {
      toast.error("Failed to change password");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success("Account deleted successfully");
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  const generateApiKeyMutation = useMutation({
    mutationFn: generateApiKey,
    onSuccess: (data) => {
      setNewlyCreatedKey(data.key);
      setApiKeys([
        ...apiKeys,
        {
          id: data.id,
          name: newKeyName,
          key: data.key,
          createdAt: new Date().toISOString(),
          lastUsed: "",
        },
      ]);
      setKeyBeingCreated(false);
      setNewKeyName("");
      toast.success("API key generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate API key");
    },
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle notification toggle
  const handleToggleNotification = (key: keyof typeof formData.emailNotifications) => {
    setFormData({
      ...formData,
      emailNotifications: {
        ...formData.emailNotifications,
        [key]: !formData.emailNotifications[key],
      },
    });
  };

  // Handle profile update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      type: "profile",
    };
    updateProfileMutation.mutate(profileData);
  };

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    const passwordData = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      type: "password",
    };
    
    changePasswordMutation.mutate(passwordData);
  };

  // Handle theme change
  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setSelectedTheme(theme);
    
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      localStorage.removeItem("theme");
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
    
    toast.success(`Theme changed to ${theme}`);
  };

  // Handle API key generation
  const handleGenerateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyName) {
      toast.error("Please provide a name for your API key");
      return;
    }
    
    generateApiKeyMutation.mutate({ name: newKeyName });
  };

  // Handle API key deletion
  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId));
    toast.success("API key deleted");
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle preferences update
  const handleUpdatePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    
    const preferencesData = {
      modelPreference: formData.modelPreference,
      language: formData.language,
      emailNotifications: formData.emailNotifications,
      type: "preferences",
    };
    
    updateProfileMutation.mutate(preferencesData);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <MainLayout title="Settings">
      <div className="container max-w-6xl py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Account
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" /> API
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Preferences
            </TabsTrigger>
          </TabsList>

          {/* Account Tab Content */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
              <p className="text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" /> 
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your account? All of your data 
                      including agents, prompts, and settings will be permanently removed.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </TabsContent>

          {/* Security Tab Content */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={
                    changePasswordMutation.isPending ||
                    !formData.currentPassword ||
                    !formData.newPassword ||
                    !formData.confirmNewPassword ||
                    formData.newPassword !== formData.confirmNewPassword
                  }
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Update Password
                    </>
                  )}
                </Button>
              </form>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                <Switch id="2fa" />
              </div>
              <p className="text-muted-foreground mb-4">
                Add an extra layer of security to your account by enabling two-factor
                authentication.
              </p>
              <Button variant="outline" className="gap-2">
                <HelpCircle className="h-4 w-4" /> Learn More
              </Button>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Connected Services</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Connect
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">
                Connect your account to other services for additional features and 
                integrations.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <span>Google</span>
                  </div>
                  <Button variant="ghost" size="sm">Disconnect</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-500" />
                    <span>Stripe</span>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* API Tab Content */}
          <TabsContent value="api" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <p className="text-muted-foreground mb-4">
                Manage your API keys for accessing the AI Agent Generator API.
                Keep these keys secret and never share them publicly.
              </p>
              
              {/* Create new API key form */}
              {keyBeingCreated ? (
                <form onSubmit={handleGenerateApiKey} className="mb-6 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-3">Generate New API Key</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., Development, Production"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setKeyBeingCreated(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!newKeyName || generateApiKeyMutation.isPending}
                      >
                        {generateApiKeyMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Generating...
                          </>
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <Button
                  onClick={() => setKeyBeingCreated(true)}
                  className="mb-6 gap-2"
                >
                  <Plus className="h-4 w-4" /> New API Key
                </Button>
              )}
              
              {/* Show newly created key */}
              {newlyCreatedKey && (
                <div className="mb-6 p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Your New API Key</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                    >
                      <Copy className="h-4 w-4" /> Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    This is the only time your API key will be displayed. 
                    Please copy it now and store it securely.
                  </p>
                  <div className="bg-background p-3 rounded border font-mono text-sm break-all">
                    {newlyCreatedKey}
                  </div>
                </div>
              )}
              
              {/* API keys list */}
              {apiKeys.length > 0 ? (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created: {formatDate(apiKey.createdAt)}
                            {apiKey.lastUsed && ` • Last used: ${formatDate(apiKey.lastUsed)}`}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this API key? Any 
                                applications using this key will no longer be able
                                to access the API.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteApiKey(apiKey.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="flex items-center">
                        <div className="font-mono text-sm">
                          {apiKey.key.substring(0, 12)}•••••••••••••••••••••••
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <Key className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No API Keys</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't created any API keys yet. Create one to get started
                    with our API.
                  </p>
                  <Button onClick={() => setKeyBeingCreated(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create API Key
                  </Button>
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
              <p className="text-muted-foreground mb-4">
                Learn how to integrate with our AI Agent API to create, manage, and
                run AI agents programmatically.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Globe className="h-4 w-4" /> View Documentation
                </Button>
                <Button variant="outline" className="gap-2">
                  <HelpCircle className="h-4 w-4" /> API Support
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab Content */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 p-3 h-auto",
                        selectedTheme === "light" && "border-primary"
                      )}
                      onClick={() => handleThemeChange("light")}
                    >
                      <Sun className="h-5 w-5" />
                      <span>Light</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 p-3 h-auto",
                        selectedTheme === "dark" && "border-primary"
                      )}
                      onClick={() => handleThemeChange("dark")}
                    >
                      <Moon className="h-5 w-5" />
                      <span>Dark</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 p-3 h-auto",
                        selectedTheme === "system" && "border-primary"
                      )}
                      onClick={() => handleThemeChange("system")}
                    >
                      <div className="flex">
                        <Sun className="h-5 w-5" />
                        <Moon className="h-5 w-5" />
                      </div>
                      <span>System</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>
              <form onSubmit={handleUpdatePreferences} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modelPreference">Default AI Model</Label>
                  <Select
                    value={formData.modelPreference}
                    onValueChange={(value) =>
                      setFormData({ ...formData, modelPreference: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Powerful, Slower)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</SelectItem>
                      <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                      <SelectItem value="llama-3">Llama 3 (Open Source)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Product Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and improvements
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications.updates}
                      onCheckedChange={() => handleToggleNotification("updates")}
                    />
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tips & Tutorials</Label>
                      <p className="text-sm text-muted-foreground">
                        Helpful tips on how to make the most of our platform
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications.tips}
                      onCheckedChange={() => handleToggleNotification("tips")}
                    />
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usage Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of your AI agent usage and performance
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications.usage}
                      onCheckedChange={() => handleToggleNotification("usage")}
                    />
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Important notifications about your account security
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications.security}
                      onCheckedChange={() => handleToggleNotification("security")}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="gap-2">
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Preferences
                    </>
                  )}
                </Button>
              </form>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Analytics & Usage Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect anonymous usage data to improve our service
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Store Conversation History</h3>
                      <p className="text-sm text-muted-foreground">
                        Save your agent conversations for future reference
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <HelpCircle className="h-4 w-4" /> Privacy Policy
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Trash2 className="h-4 w-4" /> Delete My Data
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 