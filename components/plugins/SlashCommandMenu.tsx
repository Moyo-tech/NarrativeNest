'use client'

import { useRef, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { SlashCommand, CommandCategory } from './slashCommands/types'
import { formatCategoryName } from './slashCommands'
import { dropdownMenu, spring, staggerContainerFast, staggerItem } from '@/lib/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

interface SlashCommandMenuProps {
  commands: SlashCommand[]
  selectedIndex: number
  onSelect: (command: SlashCommand) => void
  position: { x: number; y: number }
  query: string
}

// Animation variants
const menuVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...spring.snappy,
      staggerChildren: 0.02,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.15 },
  },
}

const categoryVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1 },
  },
}

export function SlashCommandMenu({
  commands,
  selectedIndex,
  onSelect,
  position,
  query,
}: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Auto-scroll selected item into view
  useEffect(() => {
    if (menuRef.current) {
      const selectedElement = menuRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      )
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, SlashCommand[]> = {
      'basic-blocks': [],
      'formatting': [],
      'advanced-blocks': [],
      'beat-boards': [],
      'ai-actions': [],
    }

    commands.forEach((cmd) => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd)
      }
    })

    return groups
  }, [commands])

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        variants={prefersReducedMotion ? {} : menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="slash-command-menu"
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          zIndex: 1000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary-800 rounded-xl shadow-2xl border border-primary-700/30 p-2 w-80 max-h-96 overflow-y-auto">
          {query && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-2 text-xs text-neutral-400 border-b border-primary-700/30 mb-2"
            >
              Searching for: <span className="text-white font-medium">&ldquo;{query}&rdquo;</span>
            </motion.div>
          )}

          {Object.entries(groupedCommands).map(([category, cmds]) => {
            if (cmds.length === 0) return null

            return (
              <motion.div
                key={category}
                variants={prefersReducedMotion ? {} : categoryVariants}
                className="mb-2 last:mb-0"
              >
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-3 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide"
                >
                  {formatCategoryName(category)}
                </motion.div>
                <div className="space-y-0.5">
                  {cmds.map((cmd) => {
                    const globalIndex = commands.indexOf(cmd)
                    const isSelected = globalIndex === selectedIndex

                    return (
                      <motion.button
                        key={cmd.id}
                        data-index={globalIndex}
                        variants={prefersReducedMotion ? {} : itemVariants}
                        onClick={() => onSelect(cmd)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-colors text-left
                          ${
                            isSelected
                              ? 'bg-accent-700/30 text-white border border-accent-600/30'
                              : 'text-neutral-300 hover:bg-primary-700/50'
                          }
                        `}
                        whileHover={prefersReducedMotion ? {} : {
                          x: 4,
                          backgroundColor: 'rgba(139, 92, 246, 0.15)',
                          transition: { duration: 0.15 },
                        }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      >
                        <motion.div
                          whileHover={prefersReducedMotion ? {} : { scale: 1.2, rotate: 5 }}
                          transition={spring.snappy}
                        >
                          <cmd.icon className="flex-shrink-0 w-4 h-4" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{cmd.name}</div>
                          {cmd.description && (
                            <div className="text-xs text-neutral-500 truncate mt-0.5">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.kbd
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={spring.snappy}
                              className="text-xs bg-primary-900 px-1.5 py-0.5 rounded border border-primary-700"
                            >
                              Enter
                            </motion.kbd>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}

          {commands.length === 0 && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-8 text-center text-neutral-500 text-sm"
            >
              No commands found matching &ldquo;{query}&rdquo;
            </motion.div>
          )}

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-3 py-2 text-xs text-neutral-600 border-t border-primary-700/30 mt-2"
          >
            <div className="flex items-center justify-between">
              <span>
                Navigate: <kbd className="bg-primary-900 px-1 rounded">Up</kbd>{' '}
                <kbd className="bg-primary-900 px-1 rounded">Down</kbd>
              </span>
              <span>
                Select: <kbd className="bg-primary-900 px-1 rounded">Enter</kbd>
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
