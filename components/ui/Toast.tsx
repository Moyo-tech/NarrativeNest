'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { useToast, Toast as ToastType } from '@/context/ToastContext';
import { toastSlideIn } from '@/lib/animations';
import { cn } from '@/lib/cn';

// ============================================
// TOAST ITEM
// ============================================
interface ToastItemProps {
  toast: ToastType;
  onRemove: () => void;
}

const icons = {
  success: FiCheck,
  error: FiX,
  warning: FiAlertTriangle,
  info: FiInfo,
};

const styles = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-500/30',
    icon: 'bg-green-500/20 text-green-400',
    progress: 'bg-green-500',
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-500/30',
    icon: 'bg-red-500/20 text-red-400',
    progress: 'bg-red-500',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-500/30',
    icon: 'bg-yellow-500/20 text-yellow-400',
    progress: 'bg-yellow-500',
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-500/30',
    icon: 'bg-blue-500/20 text-blue-400',
    progress: 'bg-blue-500',
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <motion.div
      layout
      variants={toastSlideIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-2xl backdrop-blur-md border shadow-elevation-2 overflow-hidden min-w-[320px] max-w-[420px]',
        style.bg,
        style.border
      )}
    >
      {/* Icon */}
      <div className={cn('p-2 rounded-xl shrink-0', style.icon)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Message */}
      <p className="text-sm text-neutral-100 font-medium flex-1 pt-1">
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={onRemove}
        className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <FiX className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className={cn('absolute bottom-0 left-0 h-1 rounded-full', style.progress)}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

// ============================================
// TOAST CONTAINER
// ============================================
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
