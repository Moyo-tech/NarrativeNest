'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the user has enabled "Reduce Motion" in their OS settings.
 * This allows us to disable or simplify animations for accessibility.
 *
 * @returns boolean - true if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers (Safari < 14)
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns animation variants that respect reduced motion preference.
 * If reduced motion is enabled, returns instant transitions.
 */
export function useAccessibleAnimation<T extends object>(
  variants: T,
  reducedVariants?: T
): T {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return reducedVariants || {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    } as T;
  }

  return variants;
}

/**
 * Returns transition config that respects reduced motion.
 * If reduced motion is enabled, returns instant transition.
 */
export function useAccessibleTransition(transition: object): object {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return { duration: 0 };
  }

  return transition;
}
