'use client'

import { useState } from 'react'
import {
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiArrowRight,
  FiUser,
  FiTarget,
  FiAlertTriangle,
  FiLock,
  FiEye,
  FiMic,
} from 'react-icons/fi'
import type { CharacterItem, CharacterPassportProps } from '../../types'

const ROLE_COLORS: Record<string, string> = {
  protagonist: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  antagonist: 'bg-red-600/20 text-red-300 border-red-600/30',
  mentor: 'bg-purple-600/20 text-purple-300 border-purple-600/30',
  sidekick: 'bg-green-600/20 text-green-300 border-green-600/30',
  love: 'bg-pink-600/20 text-pink-300 border-pink-600/30',
  supporting: 'bg-neutral-600/20 text-neutral-300 border-neutral-600/30',
  default: 'bg-neutral-600/20 text-neutral-300 border-neutral-600/30',
}

function getRoleColor(role: string): string {
  const normalized = role.toLowerCase()
  if (normalized.includes('protag') || normalized.includes('hero')) return ROLE_COLORS.protagonist
  if (normalized.includes('antag') || normalized.includes('villain')) return ROLE_COLORS.antagonist
  if (normalized.includes('mentor') || normalized.includes('guide')) return ROLE_COLORS.mentor
  if (normalized.includes('sidekick') || normalized.includes('friend')) return ROLE_COLORS.sidekick
  if (normalized.includes('love') || normalized.includes('romantic')) return ROLE_COLORS.love
  return ROLE_COLORS.supporting
}

interface ExtendedCharacterPassportProps extends CharacterPassportProps {
  onInsertToEditor?: (content: string) => void
}

export function CharacterPassport({
  character,
  onUpdate,
  onDelete,
  onInsertToEditor,
}: ExtendedCharacterPassportProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<CharacterItem>(character)

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(character)
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    const content = formatCharacterForEditor(character)
    e.dataTransfer.setData(
      'application/x-beatboard-drag',
      JSON.stringify({
        type: 'character',
        id: character.id,
        content,
      })
    )
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleInsert = () => {
    if (onInsertToEditor) {
      onInsertToEditor(formatCharacterForEditor(character))
    }
  }

  const roleColor = getRoleColor(character.role)

  // Generate initials for avatar
  const initials = character.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      className={`
        character-passport glass-card rounded-xl border border-primary-700/30
        hover:border-accent-600/40 transition-all duration-200
        ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {/* Header with avatar */}
      <div className="flex items-start gap-4 p-4 border-b border-primary-700/20">
        {/* Avatar */}
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-accent-600/30 to-primary-700/50 flex items-center justify-center border border-primary-600/30">
          <span className="text-lg font-bold text-accent-300">{initials}</span>
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-2 py-1 rounded bg-primary-800/50 border border-primary-700/30 text-white font-medium focus:outline-none focus:border-accent-600/50"
                placeholder="Character name"
              />
              <input
                type="text"
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                className="w-full px-2 py-1 rounded bg-primary-800/50 border border-primary-700/30 text-sm text-neutral-300 focus:outline-none focus:border-accent-600/50"
                placeholder="Role (e.g., Protagonist, Mentor)"
              />
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-white truncate">{character.name}</h4>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${roleColor}`}>
                {character.role}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
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
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleInsert}
                className="p-1.5 rounded-lg text-accent-400 hover:bg-accent-700/30 transition-colors"
                title="Insert to editor"
              >
                <FiArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Character details */}
      <div className="p-4 space-y-3">
        {/* Motivation */}
        <DetailField
          icon={FiTarget}
          label="Motivation"
          value={character.motivation}
          isEditing={isEditing}
          onChange={(v) => setEditData({ ...editData, motivation: v })}
        />

        {/* Flaw */}
        {(character.flaw || isEditing) && (
          <DetailField
            icon={FiAlertTriangle}
            label="Flaw"
            value={character.flaw || ''}
            isEditing={isEditing}
            onChange={(v) => setEditData({ ...editData, flaw: v })}
          />
        )}

        {/* Secret */}
        {(character.secret || isEditing) && (
          <DetailField
            icon={FiLock}
            label="Secret"
            value={character.secret || ''}
            isEditing={isEditing}
            onChange={(v) => setEditData({ ...editData, secret: v })}
          />
        )}

        {/* Appearance */}
        {(character.appearance || isEditing) && (
          <DetailField
            icon={FiEye}
            label="Appearance"
            value={character.appearance || ''}
            isEditing={isEditing}
            onChange={(v) => setEditData({ ...editData, appearance: v })}
          />
        )}

        {/* Voice Notes */}
        {(character.voiceNotes || isEditing) && (
          <DetailField
            icon={FiMic}
            label="Voice"
            value={character.voiceNotes || ''}
            isEditing={isEditing}
            onChange={(v) => setEditData({ ...editData, voiceNotes: v })}
          />
        )}
      </div>
    </div>
  )
}

// Helper component for detail fields
function DetailField({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  isEditing: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 rounded bg-primary-800/50 border border-primary-700/30 text-sm text-neutral-200 focus:outline-none focus:border-accent-600/50"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        ) : value ? (
          <p className="text-sm text-neutral-300">{value}</p>
        ) : (
          <p className="text-sm text-neutral-600 italic">Not specified</p>
        )}
      </div>
    </div>
  )
}

// Format character for editor insertion
function formatCharacterForEditor(character: CharacterItem): string {
  let content = `## ${character.name}\n\n`
  content += `**Role:** ${character.role}\n\n`

  if (character.motivation) {
    content += `**Motivation:** ${character.motivation}\n\n`
  }
  if (character.flaw) {
    content += `**Flaw:** ${character.flaw}\n\n`
  }
  if (character.secret) {
    content += `**Secret:** ${character.secret}\n\n`
  }
  if (character.appearance) {
    content += `**Appearance:** ${character.appearance}\n\n`
  }
  if (character.voiceNotes) {
    content += `**Voice Notes:** ${character.voiceNotes}\n\n`
  }

  return content.trim()
}

export default CharacterPassport
