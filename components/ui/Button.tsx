'use client'

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { spring, hoverScale, tapScale } from '@/lib/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-950 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-accent-700 to-accent-600 text-white focus:ring-accent-600',
        secondary:
          'bg-primary-800 text-neutral-200 border border-primary-700/50 hover:bg-primary-700 focus:ring-primary-600',
        ghost: 'text-neutral-300 hover:bg-primary-800/50 hover:text-white focus:ring-primary-700',
        danger: 'bg-error-DEFAULT text-white hover:bg-error-dark focus:ring-error-DEFAULT',
        success: 'bg-success-DEFAULT text-white hover:bg-success-dark focus:ring-success-DEFAULT',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  isLoading?: boolean
  disableAnimation?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({
    className,
    variant,
    size,
    children,
    isLoading,
    disabled,
    disableAnimation = false,
    ...props
  }, ref) {
    const prefersReducedMotion = useReducedMotion()
    const shouldAnimate = !prefersReducedMotion && !disableAnimation && !disabled && !isLoading

    // Common button content
    const buttonContent = isLoading ? (
      <>
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="-ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </motion.svg>
        Loading...
      </>
    ) : (
      children
    )

    // Non-animated button for disabled state or reduced motion
    if (!shouldAnimate) {
      return (
        <button
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          disabled={disabled || isLoading}
          {...props}
        >
          {buttonContent}
        </button>
      )
    }

    // Animated button
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        whileHover={{
          scale: 1.03,
          y: -2,
          boxShadow: variant === 'primary'
            ? '0 8px 30px rgba(139, 92, 246, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
        whileTap={{
          scale: 0.97,
          y: 0,
        }}
        transition={spring.snappy}
        {...(props as any)}
      >
        {buttonContent}
      </motion.button>
    )
  }
)

export default Button
