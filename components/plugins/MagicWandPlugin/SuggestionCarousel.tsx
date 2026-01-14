'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { FiX, FiSend, FiRefreshCw } from 'react-icons/fi'
import { SuggestionCard } from './SuggestionCard'

interface SuggestionCarouselProps {
  suggestions: string[]
  isLoading: boolean
  onSelectSuggestion: (suggestion: string, index: number) => void
  onClose: () => void
  position: { x: number; y: number }
  onFollowUp?: (instruction: string) => void
  onRegenerate?: () => void
}

export function SuggestionCarousel({
  suggestions,
  isLoading,
  onSelectSuggestion,
  onClose,
  position,
  onFollowUp,
  onRegenerate,
}: SuggestionCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [followUpText, setFollowUpText] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedSuggestions, setEditedSuggestions] = useState<string[]>([])

  // Initialize edited suggestions when suggestions change
  useEffect(() => {
    setEditedSuggestions(suggestions)
  }, [suggestions])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (carouselRef.current && !carouselRef.current.contains(event.target as Node)) {
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

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingIndex !== null) {
          setEditingIndex(null)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, editingIndex])

  const handleFollowUpSubmit = () => {
    if (followUpText.trim() && onFollowUp) {
      onFollowUp(followUpText.trim())
      setFollowUpText('')
    }
  }

  const handleEditSuggestion = (index: number, newText: string) => {
    const updated = [...editedSuggestions]
    updated[index] = newText
    setEditedSuggestions(updated)
  }

  // Show 3 shimmer cards while loading, or the actual suggestions
  const cardsToShow = isLoading ? [null, null, null] : editedSuggestions.slice(0, 3)

  return createPortal(
    <div className="suggestion-carousel-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        ref={carouselRef}
        className="suggestion-carousel-container w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col"
      >
        <div className="glass-card rounded-xl shadow-2xl border border-primary-700/30 p-4 flex flex-col max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-neutral-200">
                {isLoading ? 'Generating suggestions...' : `Choose a variation`}
              </span>
              {!isLoading && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-primary-700/50 transition-colors"
                  title="Regenerate suggestions"
                >
                  <FiRefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-primary-700/50 transition-colors"
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Container - Vertical Layout */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cardsToShow.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion || ''}
                index={index}
                isLoading={isLoading}
                isEditing={editingIndex === index}
                onClick={() => {
                  if (suggestion) {
                    onSelectSuggestion(editedSuggestions[index] || suggestion, index)
                  }
                }}
                onEdit={() => setEditingIndex(editingIndex === index ? null : index)}
                onTextChange={(text) => handleEditSuggestion(index, text)}
              />
            ))}
          </div>

          {/* Follow-up Input */}
          {!isLoading && onFollowUp && (
            <div className="mt-4 pt-3 border-t border-primary-700/30 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleFollowUpSubmit()
                    }
                  }}
                  placeholder="Ask for more edits or refinements..."
                  className="flex-1 px-3 py-2 rounded-lg bg-primary-800/50 border border-primary-700/30 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-accent-600/50"
                />
                <button
                  onClick={handleFollowUpSubmit}
                  disabled={!followUpText.trim()}
                  className="px-3 py-2 rounded-lg bg-accent-700/50 text-white hover:bg-accent-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-600">
                Click a card to apply that variation, or ask for more edits
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
