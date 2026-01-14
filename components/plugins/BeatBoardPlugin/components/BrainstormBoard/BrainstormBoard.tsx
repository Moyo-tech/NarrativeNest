'use client'

import { useState } from 'react'
import { FiRefreshCw, FiTrash2, FiZap, FiBookmark } from 'react-icons/fi'
import { useBeatBoard } from '@/context/BeatBoardContext'
import { StickyNote } from './StickyNote'
import { KeepPile } from './KeepPile'
import type { BoardProps } from '../../types'

export function BrainstormBoard({ onInsertToEditor }: BoardProps) {
  const { state, dispatch, generateContent, clearBoard } = useBeatBoard()
  const { notes, isLoading, error, selectionContext, streamingContent } = state
  const [localLoading, setLocalLoading] = useState(false)

  // Combined loading state - either local or context
  const showLoading = localLoading || isLoading

  const keptNotes = notes.filter((n) => n.isKept)
  const activeNotes = notes.filter((n) => !n.isKept)

  const handleGenerate = async () => {
    setLocalLoading(true)
    try {
      await generateContent('brainstorm', selectionContext)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleClear = () => {
    clearBoard('brainstorm')
  }

  return (
    <div className="brainstorm-board flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-700/30">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">Brainstorm Ideas</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {notes.length > 0 ? `${activeNotes.length} ideas, ${keptNotes.length} kept` : 'Generate creative ideas'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notes.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Clear all ideas"
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
            {showLoading ? 'Generating...' : notes.length > 0 ? 'More Ideas' : 'Generate'}
          </button>
        </div>
      </div>

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
                  {streamingContent ? '💡 Brainstorming ideas...' : '⏳ Starting brainstorm...'}
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

        {showLoading && notes.length === 0 && !streamingContent ? (
          // Loading shimmer - grid of sticky notes
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg animate-pulse shimmer"
                style={{
                  backgroundColor: ['#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5', '#ede9fe'][i % 5] + '20',
                }}
              >
                <div className="p-3">
                  <div className="h-3 bg-primary-700/30 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-primary-700/30 rounded w-full mb-2"></div>
                  <div className="h-3 bg-primary-700/30 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !showLoading && notes.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-800/50 flex items-center justify-center mb-4">
              <FiZap className="w-8 h-8 text-neutral-500" />
            </div>
            <h4 className="text-neutral-300 font-medium mb-2">No Ideas Yet</h4>
            <p className="text-neutral-500 text-sm max-w-xs">
              Click Generate to brainstorm creative ideas based on your document.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Keep Pile */}
            {keptNotes.length > 0 && (
              <KeepPile
                notes={keptNotes}
                onToggleKept={(id) => dispatch({ type: 'TOGGLE_NOTE_KEPT', payload: id })}
                onInsertToEditor={onInsertToEditor}
              />
            )}

            {/* Active Ideas Grid */}
            {activeNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FiZap className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Ideas ({activeNotes.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {activeNotes
                    .sort((a, b) => a.order - b.order)
                    .map((note) => (
                      <StickyNote
                        key={note.id}
                        note={note}
                        onUpdate={(updates) =>
                          dispatch({ type: 'UPDATE_NOTE', payload: { id: note.id, updates } })
                        }
                        onDelete={() => dispatch({ type: 'DELETE_NOTE', payload: note.id })}
                        onToggleKept={() => dispatch({ type: 'TOGGLE_NOTE_KEPT', payload: note.id })}
                        onInsertToEditor={onInsertToEditor}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context indicator */}
      {selectionContext && (
        <div className="p-3 border-t border-primary-700/30 bg-primary-900/50">
          <p className="text-xs text-neutral-500">
            Context:{' '}
            <span className="text-neutral-400">
              {selectionContext.length > 100
                ? selectionContext.substring(0, 100) + '...'
                : selectionContext}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default BrainstormBoard
