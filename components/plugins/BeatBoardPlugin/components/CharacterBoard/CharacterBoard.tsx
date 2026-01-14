'use client'

import { useState } from 'react'
import { FiRefreshCw, FiTrash2, FiUsers, FiPlus } from 'react-icons/fi'
import { useBeatBoard } from '@/context/BeatBoardContext'
import { CharacterPassport } from './CharacterPassport'
import type { BoardProps } from '../../types'
import { nanoid } from 'nanoid'

export function CharacterBoard({ onInsertToEditor }: BoardProps) {
  const { state, dispatch, generateContent, clearBoard } = useBeatBoard()
  const { characters, isLoading, error, selectionContext, streamingContent } = state
  const [localLoading, setLocalLoading] = useState(false)

  // Combined loading state - either local or context
  const showLoading = localLoading || isLoading

  const handleGenerate = async () => {
    setLocalLoading(true)
    try {
      await generateContent('characters', selectionContext)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleClear = () => {
    clearBoard('characters')
  }

  const handleAddCharacter = () => {
    dispatch({
      type: 'ADD_CHARACTER',
      payload: {
        id: nanoid(),
        name: 'New Character',
        role: 'Supporting',
        motivation: '',
      },
    })
  }

  return (
    <div className="character-board flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-700/30">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">Character Profiles</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {characters.length > 0 ? `${characters.length} characters` : 'Generate character profiles'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {characters.length > 0 && (
            <>
              <button
                onClick={handleAddCharacter}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-primary-700/50 transition-colors"
                title="Add character manually"
              >
                <FiPlus className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                title="Clear characters"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={handleGenerate}
            disabled={showLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-700/50 text-white hover:bg-accent-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${showLoading ? 'animate-spin' : ''}`} />
            {showLoading ? 'Generating...' : characters.length > 0 ? 'More Characters' : 'Generate'}
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
                  {streamingContent ? '👤 Creating character profiles...' : '⏳ Starting character generation...'}
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

        {showLoading && characters.length === 0 && !streamingContent ? (
          // Loading shimmer
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="glass-card rounded-xl border border-primary-700/30 p-4 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-700/50 shimmer"></div>
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-primary-700/50 rounded shimmer mb-2"></div>
                    <div className="h-4 w-20 bg-primary-700/50 rounded shimmer"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-primary-700/50 rounded shimmer"></div>
                  <div className="h-3 w-3/4 bg-primary-700/50 rounded shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !showLoading && characters.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-800/50 flex items-center justify-center mb-4">
              <FiUsers className="w-8 h-8 text-neutral-500" />
            </div>
            <h4 className="text-neutral-300 font-medium mb-2">No Character Profiles</h4>
            <p className="text-neutral-500 text-sm max-w-xs mb-4">
              Click Generate to create detailed character profiles for your story.
            </p>
            <button
              onClick={handleAddCharacter}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 border border-primary-700/30 hover:bg-primary-700/30 transition-colors text-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Manually
            </button>
          </div>
        ) : (
          // Character cards
          <div className="space-y-4">
            {characters.map((character) => (
              <CharacterPassport
                key={character.id}
                character={character}
                onUpdate={(updates) =>
                  dispatch({ type: 'UPDATE_CHARACTER', payload: { id: character.id, updates } })
                }
                onDelete={() => dispatch({ type: 'DELETE_CHARACTER', payload: character.id })}
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

export default CharacterBoard
