'use client'

import { useState } from 'react'
import { FiBookmark, FiChevronDown, FiChevronUp, FiArrowRight, FiX } from 'react-icons/fi'
import type { StickyNote as StickyNoteType } from '../../types'

interface KeepPileProps {
  notes: StickyNoteType[]
  onToggleKept: (id: string) => void
  onInsertToEditor?: (content: string) => void
}

const NOTE_COLORS = {
  yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-100',
  pink: 'bg-pink-500/20 border-pink-500/30 text-pink-100',
  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-100',
  green: 'bg-green-500/20 border-green-500/30 text-green-100',
  purple: 'bg-purple-500/20 border-purple-500/30 text-purple-100',
}

export function KeepPile({ notes, onToggleKept, onInsertToEditor }: KeepPileProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleInsertAll = () => {
    if (onInsertToEditor) {
      const allContent = notes.map((n) => `- ${n.content}`).join('\n')
      onInsertToEditor(allContent)
    }
  }

  return (
    <div className="keep-pile glass-card rounded-xl border border-accent-600/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-accent-700/10 hover:bg-accent-700/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FiBookmark className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-accent-300">Keep Pile</span>
          <span className="px-1.5 py-0.5 rounded bg-accent-700/30 text-xs text-accent-300">
            {notes.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {notes.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleInsertAll()
              }}
              className="p-1.5 rounded-lg text-accent-400 hover:bg-accent-700/30 transition-colors"
              title="Insert all to editor"
            >
              <FiArrowRight className="w-4 h-4" />
            </button>
          )}
          {isExpanded ? (
            <FiChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <FiChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && notes.length > 0 && (
        <div className="p-3 space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`
                flex items-start gap-2 p-2 rounded-lg border
                ${NOTE_COLORS[note.color]}
              `}
            >
              <p className="flex-1 text-sm leading-relaxed">{note.content}</p>
              <button
                onClick={() => onToggleKept(note.id)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-primary-700/50 transition-colors flex-shrink-0"
                title="Remove from keep pile"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isExpanded && notes.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-xs text-neutral-500">
            Click the bookmark icon on ideas to keep them here
          </p>
        </div>
      )}
    </div>
  )
}

export default KeepPile
