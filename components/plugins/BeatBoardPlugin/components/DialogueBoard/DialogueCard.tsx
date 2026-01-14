'use client'

import { useState } from 'react'
import { FiEdit2, FiTrash2, FiCheck, FiX, FiArrowRight, FiUser } from 'react-icons/fi'
import type { DialogueItem, DialogueCardProps } from '../../types'

const TONE_COLORS: Record<string, string> = {
  sarcastic: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
  warm: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
  threatening: 'bg-red-600/20 text-red-300 border-red-600/30',
  playful: 'bg-pink-600/20 text-pink-300 border-pink-600/30',
  formal: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  casual: 'bg-green-600/20 text-green-300 border-green-600/30',
  nervous: 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30',
  confident: 'bg-purple-600/20 text-purple-300 border-purple-600/30',
  default: 'bg-neutral-600/20 text-neutral-300 border-neutral-600/30',
}

function getToneColor(tone?: string): string {
  if (!tone) return TONE_COLORS.default
  const normalized = tone.toLowerCase()
  return TONE_COLORS[normalized] || TONE_COLORS.default
}

export function DialogueCard({ dialogue, onUpdate, onDelete, onApply }: DialogueCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDialogue, setEditDialogue] = useState(dialogue.dialogue)
  const [editSpeaker, setEditSpeaker] = useState(dialogue.speaker)

  const handleSave = () => {
    onUpdate({
      dialogue: editDialogue,
      speaker: editSpeaker,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditDialogue(dialogue.dialogue)
    setEditSpeaker(dialogue.speaker)
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    const content = dialogue.speaker
      ? `${dialogue.speaker}: "${dialogue.dialogue}"`
      : dialogue.dialogue
    e.dataTransfer.setData(
      'application/x-beatboard-drag',
      JSON.stringify({
        type: 'dialogue',
        id: dialogue.id,
        content,
      })
    )
    e.dataTransfer.effectAllowed = 'copy'
  }

  const toneColor = getToneColor(dialogue.tone)

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      className={`
        dialogue-card glass-card rounded-xl border border-primary-700/30
        hover:border-accent-600/40 transition-all duration-200
        ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-primary-700/20">
        <div className="flex items-center gap-2">
          {/* Speaker */}
          <div className="flex items-center gap-1.5">
            <FiUser className="w-3.5 h-3.5 text-neutral-500" />
            {isEditing ? (
              <input
                type="text"
                value={editSpeaker}
                onChange={(e) => setEditSpeaker(e.target.value)}
                className="px-2 py-0.5 rounded bg-primary-800/50 border border-primary-700/30 text-sm text-white focus:outline-none focus:border-accent-600/50 w-32"
                placeholder="Speaker"
              />
            ) : (
              <span className="text-sm font-medium text-white">{dialogue.speaker || 'Unknown'}</span>
            )}
          </div>

          {/* Tone badge */}
          {dialogue.tone && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${toneColor}`}>
              {dialogue.tone}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 rounded-lg text-green-400 hover:bg-green-900/20 transition-colors"
                title="Save"
              >
                <FiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-primary-700/50 transition-colors"
                title="Cancel"
              >
                <FiX className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-primary-700/50 transition-colors"
                title="Edit"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onApply}
                className="p-1.5 rounded-lg text-accent-400 hover:bg-accent-700/30 transition-colors"
                title="Apply this dialogue"
              >
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <textarea
            value={editDialogue}
            onChange={(e) => setEditDialogue(e.target.value)}
            rows={3}
            className="w-full px-2 py-1 rounded bg-primary-800/50 border border-primary-700/30 text-sm text-neutral-200 focus:outline-none focus:border-accent-600/50 resize-y"
            placeholder="Dialogue text"
          />
        ) : (
          <p className="text-sm text-neutral-200 leading-relaxed italic">&ldquo;{dialogue.dialogue}&rdquo;</p>
        )}
      </div>
    </div>
  )
}

export default DialogueCard
