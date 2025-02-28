import { useEffect, useState, useCallback } from 'react';
import { useGlobalState } from '../contexts/global-state-context';

type Theme = 'light' | 'dark' | 'system';

/**
 * Hook for theme management that integrates with global state
 * 
 * @returns Theme management utilities
 * 
 * @example
 * ```tsx
 * const { 
 *   theme, 
 *   systemTheme, 
 *   resolvedTheme, 
 *   setTheme,
 *   toggleTheme 
 * } = useTheme();
 * 
 * return (
 *   <button onClick={toggleTheme}>
 *     Current theme: {resolvedTheme}
 *   </button>
 * );
 * ```
 */
export function useTheme() {
  const { state, setTheme: setGlobalTheme } = useGlobalState();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );
  
  // Get the theme from global state
  const theme = state.theme;
  
  // Resolved theme is either the selected theme or the system preference
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  
  // Sets the theme in global state
  const setTheme = useCallback((newTheme: Theme) => {
    setGlobalTheme(newTheme);
    
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, [setGlobalTheme]);
  
  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    if (resolvedTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [resolvedTheme, setTheme]);
  
  // Apply the theme to the document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old classes
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(resolvedTheme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#121212' : '#ffffff'
      );
    }
  }, [resolvedTheme]);
  
  // Listen for system theme changes
  useEffect(() => {
    // Check for SSR
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    // Add listener for media query changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  // Initialize theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setGlobalTheme(savedTheme);
    }
  }, [setGlobalTheme]);
  
  return {
    theme,
    systemTheme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isLightTheme: resolvedTheme === 'light',
    isDarkTheme: resolvedTheme === 'dark',
  };
} 