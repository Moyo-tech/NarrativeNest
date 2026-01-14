'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input-glass',
            error && 'ring-2 ring-error-DEFAULT border-error-DEFAULT',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-light">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
