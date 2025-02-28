import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { AuthProvider } from '../contexts/auth-context';
import { PreferencesProvider } from '../contexts/preferences-context';
import { DragProvider } from '../contexts/drag-context';
import { GlobalStateProvider } from '../contexts/global-state-context';
import { ErrorBoundary } from '../components/ui/error-boundary';
import { ErrorFallback } from '../components/ui/error-fallback';
import { Toaster } from '../components/ui/toaster';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Composes all application providers in the correct order
 * 
 * @example
 * ```tsx
 * <AppProviders>
 *   <App />
 * </AppProviders>
 * ```
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <GlobalStateProvider>
          <PreferencesProvider>
            <AuthProvider>
              <DragProvider>
                <>
                  {children}
                  <Toaster />
                </>
              </DragProvider>
            </AuthProvider>
          </PreferencesProvider>
        </GlobalStateProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
} 