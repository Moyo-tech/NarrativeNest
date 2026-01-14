'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import { FiFeather, FiMic } from 'react-icons/fi'
import type { TransformationAction } from './types'

interface TransformationMenuProps {
  position: { x: number; y: number }
  onActionSelect: (action: TransformationAction) => void
  onClose: () => void
}

interface ActionButton {
  id: TransformationAction
  label: string
  icon: typeof FiFeather
  description: string
}

const ACTIONS: ActionButton[] = [
  {
    id: 'rewrite',
    label: 'Rewrite Selection',
    icon: FiFeather,
    description: 'Rephrase and improve your text',
  },
  {
    id: 'dialoguetone',
    label: 'Dialogue Tone',
    icon: FiMic,
    description: 'Adjust emotional tone',
  },
]

export function TransformationMenu({ position, onActionSelect, onClose }: TransformationMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Small delay to prevent immediate close from wand click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      className="transformation-menu"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000,
      }}
    >
      <div className="glass-card rounded-xl shadow-2xl border border-primary-700/30 p-3 w-80 animate-slide-up">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 px-1">
          Transform Text
        </div>
        <div className="flex flex-col gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              className="
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-left transition-colors
                text-neutral-300 hover:bg-accent-700/20 hover:text-white
                border border-transparent hover:border-accent-600/30
              "
            >
              <action.icon className="flex-shrink-0 w-4 h-4" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-neutral-500 truncate">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
