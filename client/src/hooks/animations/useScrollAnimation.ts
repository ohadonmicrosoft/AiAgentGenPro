import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useAnimation, Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Default animation variants for scroll animations
 */
export const defaultScrollVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

/**
 * Hook for creating scroll-triggered animations.
 * Returns a ref to attach to the element and animation controls.
 * 
 * @param threshold - Visibility threshold (0-1) that triggers the animation
 * @param rootMargin - Margin around the root
 * @returns Object containing ref and animation controls
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.1,
  rootMargin = "0px"
) {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView && !prefersReducedMotion) {
      controls.start("visible");
    }
  }, [controls, inView, prefersReducedMotion]);

  return { ref, controls, inView };
}

/**
 * Hook for creating staggered scroll animations with children.
 * Returns animation variants with customizable stagger effect.
 * 
 * @param staggerChildren - Delay between each child animation
 * @param delayChildren - Initial delay before starting animations
 * @returns Animation variants object
 */
export function useScrollAnimationVariants(
  staggerChildren = 0.1,
  delayChildren = 0.2
) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  };
}

/**
 * Hook for simple scroll animations that returns a ref and visibility state.
 * Useful when you just need to know if an element is in view.
 * 
 * @param threshold - Visibility threshold (0-1) that triggers the animation
 * @param triggerOnce - Whether to trigger only once
 * @returns Tuple containing ref and inView state
 */
export function useSimpleScrollAnimation(
  threshold = 0.1,
  triggerOnce = true
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const { inView } = useInView({
    threshold,
    triggerOnce
  });

  return [ref, inView];
} 