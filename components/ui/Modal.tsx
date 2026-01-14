'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { cn } from '@/lib/cn'
import { modalBackdrop, modalContent, spring, staggerContainer, staggerItem } from '@/lib/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  staggerChildren?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  staggerChildren = false,
}: ModalProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl',
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reduced motion variant
  const reducedMotionVariant = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const backdropVariant = prefersReducedMotion ? reducedMotionVariant : modalBackdrop
  const contentVariant = prefersReducedMotion ? reducedMotionVariant : modalContent

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              {/* Modal panel */}
              <motion.div
                variants={contentVariant}
                initial="initial"
                animate="animate"
                exit="exit"
                className={cn(
                  'relative w-full transform overflow-hidden rounded-3xl glass-card p-6 shadow-elevation-4',
                  sizeClasses[size]
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <motion.h2
                    id="modal-title"
                    className="text-2xl font-bold text-neutral-100"
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, ...spring.snappy }}
                  >
                    {title}
                  </motion.h2>
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors duration-200"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 90 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                    transition={spring.snappy}
                    aria-label="Close modal"
                  >
                    <FiX className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Content */}
                {staggerChildren ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {children}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, ...spring.gentle }}
                  >
                    {children}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
