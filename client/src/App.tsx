import { useState, Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { MainLayout } from "./layouts/main-layout";
import { useAuth } from "./hooks/use-auth";

// UI Components
import { Spinner } from "./components/ui/spinner";
import { ErrorBoundary } from "./components/ui/error-boundary";

// Lazy-loaded pages
const DashboardPage = lazy(() => import("./pages/dashboard"));
const LoginPage = lazy(() => import("./pages/login"));
const RegisterPage = lazy(() => import("./pages/register"));
const NotFoundPage = lazy(() => import("./pages/not-found"));
const AgentsPage = lazy(() => import("./pages/agents"));
const PromptsPage = lazy(() => import("./pages/prompts"));
const SettingsPage = lazy(() => import("./pages/settings"));

export default function App() {
  const { user, isLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center">
            <Spinner size="lg" />
          </div>
        }
      >
        <Switch>
          {/* Public routes */}
          {!user && (
            <>
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
            </>
          )}

          {/* Protected routes */}
          {user && (
            <Route path="/:rest*">
              {(params) => (
                <MainLayout>
                  <Switch>
                    <Route path="/" component={DashboardPage} />
                    <Route path="/dashboard" component={DashboardPage} />
                    <Route path="/agents" component={AgentsPage} />
                    <Route path="/prompts" component={PromptsPage} />
                    <Route path="/settings" component={SettingsPage} />
                    <Route component={NotFoundPage} />
                  </Switch>
                </MainLayout>
              )}
            </Route>
          )}

          {/* Fallback route */}
          <Route path="*">
            {user ? (
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            ) : (
              <LoginPage />
            )}
          </Route>
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}
