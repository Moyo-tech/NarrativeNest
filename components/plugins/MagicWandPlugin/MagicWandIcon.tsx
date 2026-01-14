'use client'

import { createPortal } from 'react-dom'
import { FiZap } from 'react-icons/fi'

interface MagicWandIconProps {
  position: { x: number; y: number }
  onClick: () => void
  isVisible: boolean
}

export function MagicWandIcon({ position, onClick, isVisible }: MagicWandIconProps) {
  if (!isVisible) return null

  return createPortal(
    <div
      className="magic-wand-icon"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000,
      }}
    >
      <button
        onClick={onClick}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-xl
          glass-card
          border border-accent-600/30
          text-accent-400
          hover:text-accent-300
          hover:border-accent-500/50
          hover:scale-110
          transition-all duration-200 ease-in-out
          shadow-lg hover:shadow-xl
          cursor-pointer
          ${isVisible ? 'animate-fade-in-scale' : 'opacity-0 scale-0'}
        `}
        aria-label="Transform text"
        title="Transform text"
      >
        <FiZap className="w-5 h-5" />
      </button>
    </div>,
    document.body
  )
}
