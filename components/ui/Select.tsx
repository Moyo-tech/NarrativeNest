'use client'

import { Fragment } from 'react'
import { Listbox } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiChevronDown } from 'react-icons/fi'
import { cn } from '@/lib/cn'
import { dropdownMenu, spring, staggerContainerFast, staggerItem } from '@/lib/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface Option {
  value: string
  label: string
}

export interface SelectProps {
  label?: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  placeholder?: string
}

export default function Select({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Select...',
}: SelectProps) {
  const prefersReducedMotion = useReducedMotion()
  const selected = options.find((opt) => opt.value === value)

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              as={motion.button}
              className={cn(
                'input-glass flex items-center justify-between w-full',
                error && 'ring-2 ring-error-DEFAULT border-error-DEFAULT'
              )}
              whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
              transition={spring.snappy}
            >
              <span className={cn('block truncate', !selected && 'text-neutral-500')}>
                {selected?.label || placeholder}
              </span>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <FiChevronDown className="h-5 w-5 text-neutral-400" aria-hidden="true" />
              </motion.div>
            </Listbox.Button>

            <AnimatePresence>
              {open && (
                <Listbox.Options
                  static
                  as={motion.ul}
                  variants={prefersReducedMotion ? {} : dropdownMenu}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute z-10 mt-2 w-full bg-primary-800 border border-primary-700/50 rounded-2xl shadow-elevation-3 max-h-60 overflow-auto py-2 focus:outline-none"
                >
                  <motion.div
                    variants={prefersReducedMotion ? {} : staggerContainerFast}
                    initial="initial"
                    animate="animate"
                  >
                    {options.map((option, index) => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        as={Fragment}
                      >
                        {({ active, selected }) => (
                          <motion.li
                            variants={prefersReducedMotion ? {} : staggerItem}
                            className={cn(
                              'relative cursor-pointer select-none py-3 pl-10 pr-4 mx-2 rounded-xl transition-colors duration-150',
                              active ? 'bg-primary-700 text-white' : 'text-neutral-300'
                            )}
                            whileHover={prefersReducedMotion ? {} : { x: 4, backgroundColor: 'rgba(107, 114, 128, 0.3)' }}
                            transition={{ duration: 0.15 }}
                          >
                            <span
                              className={cn(
                                'block truncate',
                                selected ? 'font-medium' : 'font-normal'
                              )}
                            >
                              {option.label}
                            </span>
                            <AnimatePresence>
                              {selected && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  transition={spring.bouncy}
                                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-400"
                                >
                                  <FiCheck className="h-5 w-5" aria-hidden="true" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.li>
                        )}
                      </Listbox.Option>
                    ))}
                  </motion.div>
                </Listbox.Options>
              )}
            </AnimatePresence>
          </div>
        )}
      </Listbox>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-sm text-error-light"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 text-sm text-neutral-500"
          >
            {helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
