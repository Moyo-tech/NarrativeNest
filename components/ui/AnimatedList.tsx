'use client';

import React, { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { staggerContainer, staggerContainerFast, staggerItem, staggerItemScale, staggerItemSlide } from '@/lib/animations';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

// ============================================
// TYPES
// ============================================
type StaggerType = 'default' | 'fast' | 'slow';
type ItemAnimation = 'fadeUp' | 'scale' | 'slideLeft';

interface AnimatedListProps {
  children: ReactNode;
  staggerType?: StaggerType;
  itemAnimation?: ItemAnimation;
  className?: string;
  as?: 'div' | 'ul' | 'ol';
  animatePresence?: boolean;
}

// ============================================
// CONTAINER VARIANTS MAP
// ============================================
const containerMap: Record<StaggerType, Variants> = {
  default: staggerContainer,
  fast: staggerContainerFast,
  slow: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
};

// ============================================
// ITEM VARIANTS MAP
// ============================================
const itemMap: Record<ItemAnimation, Variants> = {
  fadeUp: staggerItem,
  scale: staggerItemScale,
  slideLeft: staggerItemSlide,
};

// ============================================
// COMPONENT
// ============================================
export function AnimatedList({
  children,
  staggerType = 'default',
  itemAnimation = 'fadeUp',
  className,
  as = 'div',
  animatePresence = false,
}: AnimatedListProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = containerMap[staggerType];
  const itemVariants = itemMap[itemAnimation];

  // If reduced motion is preferred, render without animation
  if (prefersReducedMotion) {
    const Element = as;
    return <Element className={className}>{children}</Element>;
  }

  const MotionContainer = motion[as];

  const content = (
    <MotionContainer
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <motion.div
            key={child.key || index}
            variants={itemVariants}
            layout={animatePresence}
          >
            {child}
          </motion.div>
        );
      })}
    </MotionContainer>
  );

  if (animatePresence) {
    return <AnimatePresence mode="popLayout">{content}</AnimatePresence>;
  }

  return content;
}

// ============================================
// ANIMATED LIST ITEM - For manual control
// ============================================
interface AnimatedListItemProps {
  children: ReactNode;
  animation?: ItemAnimation;
  className?: string;
  index?: number;
}

export function AnimatedListItem({
  children,
  animation = 'fadeUp',
  className,
  index = 0,
}: AnimatedListItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = itemMap[animation];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATE ON SCROLL LIST
// ============================================
interface ScrollAnimatedListProps {
  children: ReactNode;
  staggerType?: StaggerType;
  itemAnimation?: ItemAnimation;
  className?: string;
  threshold?: number;
}

export function ScrollAnimatedList({
  children,
  staggerType = 'default',
  itemAnimation = 'fadeUp',
  className,
  threshold = 0.1,
}: ScrollAnimatedListProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = containerMap[staggerType];
  const itemVariants = itemMap[itemAnimation];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: threshold }}
      className={className}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <motion.div key={child.key || index} variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default AnimatedList;
