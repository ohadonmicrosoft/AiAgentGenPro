import { useEffect, useState } from 'react';

/**
 * Hook that detects if the user prefers reduced motion
 * 
 * @returns {boolean} True if the user prefers reduced motion
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * // In a component
 * const animationStyle = prefersReducedMotion
 *   ? { transition: 'none' }
 *   : { transition: 'transform 0.3s ease' };
 * ```
 */
export function useReducedMotion(): boolean {
  // Initialize with the current media query match
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // Check for SSR (server-side rendering)
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    
    // Check initial value
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    // Check for SSR
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    
    // Create media query list
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Define handler for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    // Add listener for modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
} 