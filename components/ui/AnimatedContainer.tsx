'use client';

import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { fadeIn, fadeInUp, fadeInDown, scaleIn, pageTransition } from '@/lib/animations';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

// ============================================
// TYPES
// ============================================
type AnimationType = 'fade' | 'fadeUp' | 'fadeDown' | 'scale' | 'page' | 'none';

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// ============================================
// ANIMATION MAP
// ============================================
const animationMap: Record<AnimationType, Variants | null> = {
  fade: fadeIn,
  fadeUp: fadeInUp,
  fadeDown: fadeInDown,
  scale: scaleIn,
  page: pageTransition,
  none: null,
};

// ============================================
// COMPONENT
// ============================================
export function AnimatedContainer({
  children,
  animation = 'fadeUp',
  delay = 0,
  className,
  as = 'div',
}: AnimatedContainerProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = animationMap[animation];

  // If reduced motion is preferred or no animation, render without motion
  if (prefersReducedMotion || !variants) {
    const Element = as;
    return <Element className={className}>{children}</Element>;
  }

  // Create motion component dynamically
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

// ============================================
// PAGE WRAPPER - For page transitions
// ============================================
interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <main className={className}>{children}</main>;
  }

  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.main>
  );
}

// ============================================
// SECTION WRAPPER - For section animations
// ============================================
interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SectionWrapper({ children, className, delay = 0 }: SectionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default AnimatedContainer;
