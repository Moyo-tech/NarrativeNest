'use client'

import { FiRefreshCw, FiTrash2, FiPlus, FiMove } from 'react-icons/fi'
import { useBeatBoard } from '@/context/BeatBoardContext'
import { BeatCard } from './BeatCard'
import type { BoardProps } from '../../types'

export function PlotBoard({ onInsertToEditor }: BoardProps) {
  const { state, dispatch, generateContent, clearBoard } = useBeatBoard()
  const { beats, isLoading, error, selectionContext } = state

  const handleGenerate = () => {
    generateContent('plot', selectionContext)
  }

  const handleClear = () => {
    clearBoard('plot')
  }

  return (
    <div className="plot-board flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-700/30">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">Story Beats</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {beats.length > 0 ? `${beats.length} beats` : 'Generate plot structure'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {beats.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Clear beats"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-700/50 text-white hover:bg-accent-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : beats.length > 0 ? 'Regenerate' : 'Generate'}
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
        {isLoading && beats.length === 0 ? (
          // Loading shimmer
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="glass-card rounded-xl border border-primary-700/30 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-5 w-16 bg-primary-700/50 rounded shimmer"></div>
                  <div className="h-4 w-20 bg-primary-700/50 rounded shimmer"></div>
                </div>
                <div className="h-4 w-3/4 bg-primary-700/50 rounded shimmer mb-2"></div>
                <div className="h-4 w-full bg-primary-700/50 rounded shimmer"></div>
              </div>
            ))}
          </div>
        ) : beats.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-800/50 flex items-center justify-center mb-4">
              <FiMove className="w-8 h-8 text-neutral-500" />
            </div>
            <h4 className="text-neutral-300 font-medium mb-2">No Story Beats Yet</h4>
            <p className="text-neutral-500 text-sm max-w-xs">
              Click Generate to create a story outline with beats based on your document context.
            </p>
          </div>
        ) : (
          // Beat cards
          <div className="space-y-3">
            {beats
              .sort((a, b) => a.order - b.order)
              .map((beat) => (
                <BeatCard
                  key={beat.id}
                  beat={beat}
                  onUpdate={(updates) =>
                    dispatch({ type: 'UPDATE_BEAT', payload: { id: beat.id, updates } })
                  }
                  onDelete={() => dispatch({ type: 'DELETE_BEAT', payload: beat.id })}
                  onInsertToEditor={onInsertToEditor}
                />
              ))}
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

export default PlotBoard
