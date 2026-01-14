'use client'

import { HTMLAttributes, ReactNode, forwardRef } from 'react'
import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/cn'
import { spring, fadeInUp, scaleIn } from '@/lib/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

// ============================================
// TYPES
// ============================================
type EntranceAnimation = 'none' | 'fadeUp' | 'scale'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode
  variant?: 'glass' | 'solid'
  hover?: boolean
  entrance?: EntranceAnimation
  delay?: number
  loading?: boolean
}

// ============================================
// SKELETON COMPONENT
// ============================================
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card-glass animate-pulse', className)}>
      <div className="space-y-4 p-6">
        <div className="h-4 bg-primary-700/50 rounded-lg w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-primary-700/50 rounded-lg w-full" />
          <div className="h-3 bg-primary-700/50 rounded-lg w-full" />
          <div className="h-3 bg-primary-700/50 rounded-lg w-2/3" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// ANIMATION VARIANTS
// ============================================
const entranceVariants: Record<EntranceAnimation, Variants | null> = {
  none: null,
  fadeUp: fadeInUp,
  scale: scaleIn,
}

// ============================================
// MAIN COMPONENT
// ============================================
const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({
    children,
    variant = 'glass',
    hover = false,
    entrance = 'none',
    delay = 0,
    loading = false,
    className = '',
    ...props
  }, ref) {
    const prefersReducedMotion = useReducedMotion()
    const baseClass = variant === 'glass' ? 'card-glass' : 'card-solid'

    // Show skeleton if loading
    if (loading) {
      return <CardSkeleton className={className} />
    }

    // Determine if we should animate
    const shouldAnimate = !prefersReducedMotion && (hover || entrance !== 'none')
    const entranceVariant = entranceVariants[entrance]

    // Non-animated card
    if (!shouldAnimate) {
      return (
        <div
          ref={ref}
          className={cn(
            baseClass,
            hover && 'hover:scale-[1.02] hover:shadow-elevation-3 cursor-pointer transition-all duration-200',
            className
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Animated card
    return (
      <motion.div
        ref={ref}
        className={cn(baseClass, hover && 'cursor-pointer', className)}
        variants={entranceVariant || undefined}
        initial={entranceVariant ? 'initial' : undefined}
        animate={entranceVariant ? 'animate' : undefined}
        exit={entranceVariant ? 'exit' : undefined}
        transition={{ delay }}
        whileHover={
          hover
            ? {
                y: -6,
                scale: 1.01,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.1)',
                transition: spring.snappy,
              }
            : undefined
        }
        whileTap={hover ? { scale: 0.99, y: -2 } : undefined}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }
)

// ============================================
// CARD COMPONENTS FOR COMPOSITION
// ============================================
interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-neutral-100', className)}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-neutral-400 mt-1', className)}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-primary-700/30', className)}>
      {children}
    </div>
  )
}

export default Card
