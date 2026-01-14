'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit2, FiTrash2, FiCheck, FiX, FiArrowRight, FiMove } from 'react-icons/fi'
import type { BeatItem, BeatCardProps } from '../../types'
import { spring, scaleIn } from '@/lib/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const ACT_COLORS = {
  1: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  2: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
  3: 'bg-purple-600/20 text-purple-300 border-purple-600/30',
}

const BEAT_TYPE_LABELS: Record<string, string> = {
  setup: 'Setup',
  'inciting-incident': 'Inciting Incident',
  confrontation: 'Confrontation',
  midpoint: 'Midpoint',
  climax: 'Climax',
  resolution: 'Resolution',
}

interface ExtendedBeatCardProps extends BeatCardProps {
  onInsertToEditor?: (content: string) => void
}

export function BeatCard({ beat, onUpdate, onDelete, onInsertToEditor }: ExtendedBeatCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(beat.title)
  const [editDescription, setEditDescription] = useState(beat.description)
  const [isDragging, setIsDragging] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(beat.title)
    setEditDescription(beat.description)
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    const content = `## ${beat.title}\n\n${beat.description}`
    e.dataTransfer.setData(
      'application/x-beatboard-drag',
      JSON.stringify({
        type: 'beat',
        id: beat.id,
        content,
      })
    )
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleInsert = () => {
    if (onInsertToEditor) {
      const content = `## ${beat.title}\n\n${beat.description}`
      onInsertToEditor(content)
    }
  }

  const actColor = beat.actNumber ? ACT_COLORS[beat.actNumber] : ACT_COLORS[1]

  return (
    <motion.div
      layout
      draggable={!isEditing ? "true" : "false"}
      onDragStart={handleDragStart as any}
      onDragEnd={handleDragEnd as any}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.7 : 1,
        y: 0,
        scale: isDragging ? 0.98 : 1,
        boxShadow: isDragging
          ? '0 20px 40px rgba(0, 0, 0, 0.4)'
          : '0 4px 15px rgba(0, 0, 0, 0.1)',
      }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: -20, scale: 0.95 }}
      whileHover={prefersReducedMotion || isDragging ? {} : {
        y: -4,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
      }}
      transition={spring.snappy}
      className={`
        beat-card glass-card rounded-xl border border-primary-700/30
        hover:border-accent-600/40
        ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-primary-700/20">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <AnimatePresence>
            {!isEditing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
                transition={spring.snappy}
              >
                <FiMove className="w-4 h-4 text-neutral-600 hover:text-neutral-400 transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Act badge */}
          {beat.actNumber && (
            <motion.span
              initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={spring.bouncy}
              className={`
                px-2 py-0.5 rounded text-xs font-medium border
                ${actColor}
              `}
            >
              Act {beat.actNumber}
            </motion.span>
          )}

          {/* Beat type */}
          {beat.beatType && (
            <span className="text-xs text-neutral-500">
              {BEAT_TYPE_LABELS[beat.beatType] || beat.beatType}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1"
              >
                <motion.button
                  onClick={handleSave}
                  className="p-1.5 rounded-lg text-green-400 hover:bg-green-900/20 transition-colors"
                  title="Save"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.15 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                >
                  <FiCheck className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg text-neutral-400 hover:bg-primary-700/50 transition-colors"
                  title="Cancel"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.15 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1"
              >
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-primary-700/50 transition-colors"
                  title="Edit"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.15 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  onClick={handleInsert}
                  className="p-1.5 rounded-lg text-accent-400 hover:bg-accent-700/30 transition-colors"
                  title="Insert to editor"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.15, x: 2 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                >
                  <FiArrowRight className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  onClick={onDelete}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="Delete"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.15 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="p-3"
        layout
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2 py-1 rounded bg-primary-800/50 border border-primary-700/30 text-sm text-white focus:outline-none focus:border-accent-600/50 transition-colors"
                placeholder="Beat title"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-2 py-1 rounded bg-primary-800/50 border border-primary-700/30 text-sm text-neutral-200 focus:outline-none focus:border-accent-600/50 resize-y transition-colors"
                placeholder="Description"
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
            >
              <h4 className="font-medium text-white text-sm mb-1">{beat.title}</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">{beat.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default BeatCard
