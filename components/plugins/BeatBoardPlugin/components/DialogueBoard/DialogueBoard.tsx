'use client'

import { useState } from 'react'
import { FiRefreshCw, FiTrash2, FiMessageCircle } from 'react-icons/fi'
import { useBeatBoard } from '@/context/BeatBoardContext'
import { DialogueCard } from './DialogueCard'
import type { BoardProps } from '../../types'

export function DialogueBoard({ onInsertToEditor }: BoardProps) {
  const { state, dispatch, generateContent, clearBoard } = useBeatBoard()
  const { dialogues, isLoading, error, selectionContext, streamingContent } = state
  const [localLoading, setLocalLoading] = useState(false)

  // Combined loading state - either local or context
  const showLoading = localLoading || isLoading

  const handleGenerate = async () => {
    setLocalLoading(true)
    try {
      await generateContent('dialogue', selectionContext)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleClear = () => {
    clearBoard('dialogue')
  }

  return (
    <div className="dialogue-board flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-700/30">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">Dialogue Variations</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {dialogues.length > 0
              ? `${dialogues.length} variations`
              : 'Generate dialogue alternatives'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dialogues.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Clear dialogues"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={showLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-700/50 text-white hover:bg-accent-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${showLoading ? 'animate-spin' : ''}`} />
            {showLoading ? 'Generating...' : dialogues.length > 0 ? 'More Variations' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Selected text context */}
      {selectionContext && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-primary-800/50 border border-primary-700/30">
          <p className="text-xs text-neutral-500 mb-1">Selected text to vary:</p>
          <p className="text-sm text-neutral-300 italic">&ldquo;{selectionContext}&rdquo;</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-red-900/20 border border-red-700/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Loading indicator - shows immediately when generating */}
        {showLoading && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(79, 70, 229, 0.2) 100%)',
              border: '2px solid #9333ea',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 0 30px rgba(147, 51, 234, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid rgba(147, 51, 234, 0.3)',
                  borderTopColor: '#9333ea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ color: '#c084fc', fontWeight: 600, fontSize: '14px' }}>
                  {streamingContent ? '💬 Writing dialogue variations...' : '⏳ Starting dialogue generation...'}
                </span>
                {streamingContent && (
                  <p style={{ color: '#a1a1aa', fontSize: '12px', marginTop: '4px' }}>
                    {streamingContent.length} characters received
                  </p>
                )}
              </div>
            </div>
            {streamingContent && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
                <div
                  style={{
                    color: '#e5e5e5',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {streamingContent}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '16px',
                      backgroundColor: '#9333ea',
                      marginLeft: '4px',
                      animation: 'pulse 1s infinite',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {showLoading && dialogues.length === 0 && !streamingContent ? (
          // Loading shimmer
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="glass-card rounded-xl border border-primary-700/30 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-4 w-24 bg-primary-700/50 rounded shimmer"></div>
                  <div className="h-4 w-16 bg-primary-700/50 rounded shimmer"></div>
                </div>
                <div className="h-4 w-full bg-primary-700/50 rounded shimmer mb-2"></div>
                <div className="h-4 w-4/5 bg-primary-700/50 rounded shimmer"></div>
              </div>
            ))}
          </div>
        ) : !showLoading && dialogues.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-800/50 flex items-center justify-center mb-4">
              <FiMessageCircle className="w-8 h-8 text-neutral-500" />
            </div>
            <h4 className="text-neutral-300 font-medium mb-2">No Dialogue Variations</h4>
            <p className="text-neutral-500 text-sm max-w-xs">
              {selectionContext
                ? 'Click Generate to create dialogue variations for your selected text.'
                : 'Select some dialogue in your document, then click Generate to see variations.'}
            </p>
          </div>
        ) : (
          // Dialogue cards
          <div className="space-y-3">
            {dialogues.map((dialogue) => (
              <DialogueCard
                key={dialogue.id}
                dialogue={dialogue}
                onUpdate={(updates) =>
                  dispatch({ type: 'UPDATE_DIALOGUE', payload: { id: dialogue.id, updates } })
                }
                onDelete={() => dispatch({ type: 'DELETE_DIALOGUE', payload: dialogue.id })}
                onApply={() => {
                  if (onInsertToEditor) {
                    const formattedDialogue = dialogue.speaker
                      ? `${dialogue.speaker}: "${dialogue.dialogue}"`
                      : dialogue.dialogue
                    onInsertToEditor(formattedDialogue)
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DialogueBoard
