'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import {
  FiMinus,
  FiEye,
  FiZap,
  FiSmile,
  FiHeart,
  FiAlertTriangle,
  FiUser,
  FiArrowLeft,
  FiEdit3,
  FiSend,
} from 'react-icons/fi'
import type { TransformationAction, SubOption, SubOptionConfig } from './types'

interface SubOptionsMenuProps {
  action: TransformationAction
  position: { x: number; y: number }
  onOptionSelect: (option: SubOption | string, customPrompt?: string) => void
  onBack: () => void
  onClose: () => void
}

const REWRITE_OPTIONS: SubOptionConfig[] = [
  {
    id: 'shorten',
    label: 'Shorten',
    icon: FiMinus,
    promptModifier: 'Make this text more concise while preserving meaning.',
  },
  {
    id: 'show-not-tell',
    label: "Show, Don't Tell",
    icon: FiEye,
    promptModifier: 'Rewrite using "show, don\'t tell" techniques with vivid sensory details.',
  },
  {
    id: 'intense',
    label: 'Make Intense',
    icon: FiZap,
    promptModifier: 'Make this text more dramatic and emotionally intense.',
  },
]

const DIALOGUE_TONE_OPTIONS: SubOptionConfig[] = [
  {
    id: 'sarcastic',
    label: 'Sarcastic',
    icon: FiSmile,
    promptModifier: 'Rewrite with a sarcastic, ironic tone.',
  },
  {
    id: 'flirty',
    label: 'Flirty',
    icon: FiHeart,
    promptModifier: 'Rewrite with a playful, flirtatious tone.',
  },
  {
    id: 'threatening',
    label: 'Threatening',
    icon: FiAlertTriangle,
    promptModifier: 'Rewrite with a menacing, threatening tone.',
  },
  {
    id: 'submissive',
    label: 'Submissive',
    icon: FiUser,
    promptModifier: 'Rewrite with a respectful, submissive tone.',
  },
]

const OPTIONS_MAP: Record<TransformationAction, SubOptionConfig[]> = {
  rewrite: REWRITE_OPTIONS,
  dialoguetone: DIALOGUE_TONE_OPTIONS,
}

export function SubOptionsMenu({
  action,
  position,
  onOptionSelect,
  onBack,
  onClose,
}: SubOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const options = OPTIONS_MAP[action]

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCustomInput) {
          setShowCustomInput(false)
          setCustomPrompt('')
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [onClose, showCustomInput])

  // Focus input when custom mode is shown
  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showCustomInput])

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      onOptionSelect('custom', customPrompt.trim())
    }
  }

  return createPortal(
    <div
      ref={menuRef}
      className="sub-options-menu"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000,
      }}
    >
      <div className="glass-card rounded-xl shadow-2xl border border-primary-700/30 p-3 w-80 animate-slide-right">
        {/* Header with back button */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="
              p-1.5 rounded-lg
              text-neutral-400 hover:text-white
              hover:bg-primary-700/50
              transition-colors
            "
            aria-label="Back"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            {action === 'rewrite' ? 'Rewrite Options' : 'Dialogue Tone'}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-1.5">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className="
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-left transition-colors
                text-neutral-300 hover:bg-accent-700/20 hover:text-white
                border border-transparent hover:border-accent-600/30
              "
            >
              <option.icon className="flex-shrink-0 w-4 h-4" />
              <div className="font-medium text-sm">{option.label}</div>
            </button>
          ))}

          {/* Divider */}
          <div className="my-1.5 border-t border-primary-700/30"></div>

          {/* Custom Option */}
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-left transition-colors
                text-neutral-400 hover:bg-primary-700/30 hover:text-neutral-200
                border border-dashed border-primary-600/30 hover:border-primary-500/50
              "
            >
              <FiEdit3 className="flex-shrink-0 w-4 h-4" />
              <div className="font-medium text-sm">Custom instruction...</div>
            </button>
          ) : (
            <div className="px-2 py-2">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customPrompt.trim()) {
                      e.preventDefault()
                      handleCustomSubmit()
                    }
                  }}
                  placeholder={
                    action === 'rewrite'
                      ? 'e.g., Make it more poetic...'
                      : 'e.g., Add a Nigerian accent...'
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-primary-800/50 border border-primary-700/30 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-accent-600/50"
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customPrompt.trim()}
                  className="px-3 py-2 rounded-lg bg-accent-700/50 text-white hover:bg-accent-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-600">
                Describe how you want the text transformed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
