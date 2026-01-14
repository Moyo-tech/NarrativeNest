'use client';

import { Variants, Transition } from 'framer-motion';

// ============================================
// ANIMATION DURATION STANDARDS
// ============================================
export const duration = {
  micro: 0.15,      // Hover states, micro-interactions
  fast: 0.2,        // Quick transitions
  normal: 0.3,      // Standard animations
  emphasis: 0.4,    // Emphasized animations
  page: 0.5,        // Page transitions
} as const;

// ============================================
// SPRING CONFIGURATIONS
// ============================================
export const spring = {
  // Snappy - for buttons, small elements
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Gentle - for modals, larger elements
  gentle: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } as Transition,

  // Bouncy - for attention-grabbing animations
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 15,
  } as Transition,

  // Smooth - for page transitions
  smooth: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  } as Transition,
} as const;

// ============================================
// FADE ANIMATIONS
// ============================================
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: duration.normal }
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast }
  },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: duration.fast, ease: 'easeIn' }
  },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: duration.fast, ease: 'easeIn' }
  },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.normal, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: duration.fast, ease: 'easeIn' }
  },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.normal, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: duration.fast, ease: 'easeIn' }
  },
};

// ============================================
// SCALE ANIMATIONS
// ============================================
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: spring.gentle
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast }
  },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: spring.bouncy
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: duration.fast }
  },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: spring.bouncy
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: duration.fast }
  },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================
export const slideUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: spring.gentle
  },
  exit: {
    opacity: 0,
    y: 30,
    transition: { duration: duration.fast }
  },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: spring.gentle
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: { duration: duration.fast }
  },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: spring.gentle
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: { duration: duration.fast }
  },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: spring.gentle
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: { duration: duration.fast }
  },
};

// ============================================
// STAGGER CONTAINERS
// ============================================
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// ============================================
// STAGGER ITEM VARIANTS
// ============================================
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: duration.fast }
  },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: spring.snappy
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: duration.fast }
  },
};

export const staggerItemSlide: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.normal, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: duration.fast }
  },
};

// ============================================
// MODAL / DIALOG ANIMATIONS
// ============================================
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: duration.normal }
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast }
  },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.gentle
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: duration.fast }
  },
};

// ============================================
// DROPDOWN / MENU ANIMATIONS
// ============================================
export const dropdownMenu: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.snappy
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: duration.fast }
  },
};

export const dropdownItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.fast }
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: duration.micro }
  },
};

// ============================================
// TOAST / NOTIFICATION ANIMATIONS
// ============================================
export const toastSlideIn: Variants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: spring.snappy
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: { duration: duration.fast }
  },
};

// ============================================
// HOVER STATES
// ============================================
export const hoverScale = {
  scale: 1.02,
  transition: spring.snappy,
};

export const hoverScaleSmall = {
  scale: 1.01,
  transition: spring.snappy,
};

export const hoverLift = {
  y: -4,
  transition: spring.snappy,
};

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
  transition: { duration: duration.fast },
};

// ============================================
// TAP / PRESS STATES
// ============================================
export const tapScale = {
  scale: 0.98,
  transition: { duration: duration.micro },
};

export const tapScaleSmall = {
  scale: 0.995,
  transition: { duration: duration.micro },
};

// ============================================
// PAGE TRANSITIONS
// ============================================
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.page,
      ease: [0.25, 0.1, 0.25, 1],
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration.normal,
      ease: [0.25, 0.1, 0.25, 1],
    }
  },
};

// ============================================
// SHAKE ANIMATION (for errors)
// ============================================
export const shake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// ============================================
// PULSE ANIMATION
// ============================================
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 },
  },
};

// ============================================
// SKELETON / SHIMMER
// ============================================
export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// ============================================
// DRAG ANIMATIONS
// ============================================
export const dragging = {
  scale: 1.02,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  cursor: 'grabbing',
};

export const notDragging = {
  scale: 1,
  boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
  cursor: 'grab',
};

// ============================================
// UTILITY: Create custom stagger
// ============================================
export const createStaggerContainer = (
  staggerDelay: number = 0.05,
  delayChildren: number = 0.1
): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
  exit: {
    transition: {
      staggerChildren: staggerDelay / 2,
      staggerDirection: -1,
    },
  },
});

// ============================================
// UTILITY: Create fade variant with custom distance
// ============================================
export const createFadeInUp = (distance: number = 20): Variants => ({
  initial: { opacity: 0, y: distance },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: distance,
    transition: { duration: duration.fast, ease: 'easeIn' }
  },
});
