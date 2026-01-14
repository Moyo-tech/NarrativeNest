'use client'

import { FiEdit2, FiCheck } from 'react-icons/fi'

interface SuggestionCardProps {
  suggestion: string
  index: number
  isLoading?: boolean
  isEditing?: boolean
  onClick: () => void
  onEdit?: () => void
  onTextChange?: (text: string) => void
}

export function SuggestionCard({
  suggestion,
  index,
  isLoading = false,
  isEditing = false,
  onClick,
  onEdit,
  onTextChange,
}: SuggestionCardProps) {
  if (isLoading) {
    return (
      <div className="suggestion-card w-full">
        <div className="glass-card rounded-xl border border-primary-700/30 p-4 animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-primary-700/50 rounded w-20 shimmer"></div>
            <div className="h-4 bg-primary-700/50 rounded w-16 shimmer"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-primary-700/50 rounded w-full shimmer"></div>
            <div className="h-4 bg-primary-700/50 rounded w-5/6 shimmer"></div>
            <div className="h-4 bg-primary-700/50 rounded w-4/5 shimmer"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="suggestion-card w-full">
      <div
        className={`
          glass-card rounded-xl
          border transition-all duration-200
          ${isEditing
            ? 'border-accent-500 bg-accent-700/10'
            : 'border-primary-700/30 hover:border-accent-600 hover:bg-accent-700/10'
          }
          p-4
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Option {index + 1}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className={`
                  p-1.5 rounded-lg text-xs transition-colors
                  ${isEditing
                    ? 'text-accent-400 bg-accent-700/30'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-primary-700/50'
                  }
                `}
                title={isEditing ? 'Done editing' : 'Edit this suggestion'}
              >
                {isEditing ? <FiCheck className="w-3.5 h-3.5" /> : <FiEdit2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={onClick}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent-700/50 text-white hover:bg-accent-600/50 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Content - Editable or Display */}
        {isEditing ? (
          <textarea
            value={suggestion}
            onChange={(e) => onTextChange?.(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-primary-800/50 border border-primary-700/30 text-sm text-neutral-200 focus:outline-none focus:border-accent-600/50 resize-y"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
            {suggestion}
          </p>
        )}
      </div>
    </div>
  )
}
