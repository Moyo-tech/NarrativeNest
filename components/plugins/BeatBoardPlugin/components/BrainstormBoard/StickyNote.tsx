'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBookmark, FiTrash2, FiEdit2, FiCheck, FiX, FiArrowRight } from 'react-icons/fi'
import type { StickyNote as StickyNoteType, StickyNoteProps } from '../../types'
import { spring } from '@/lib/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const NOTE_COLORS = {
  yellow: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-100',
    hover: 'hover:border-yellow-500/50',
    glow: 'rgba(234, 179, 8, 0.2)',
  },
  pink: {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-100',
    hover: 'hover:border-pink-500/50',
    glow: 'rgba(236, 72, 153, 0.2)',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-100',
    hover: 'hover:border-blue-500/50',
    glow: 'rgba(59, 130, 246, 0.2)',
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-100',
    hover: 'hover:border-green-500/50',
    glow: 'rgba(34, 197, 94, 0.2)',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-100',
    hover: 'hover:border-purple-500/50',
    glow: 'rgba(168, 85, 247, 0.2)',
  },
}

interface ExtendedStickyNoteProps extends StickyNoteProps {
  onInsertToEditor?: (content: string) => void
}

export function StickyNote({
  note,
  onUpdate,
  onDelete,
  onToggleKept,
  onInsertToEditor,
}: ExtendedStickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const [isDragging, setIsDragging] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const colors = NOTE_COLORS[note.color]

  const handleSave = () => {
    onUpdate({ content: editContent })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(note.content)
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData(
      'application/x-beatboard-drag',
      JSON.stringify({
        type: 'note',
        id: note.id,
        content: note.content,
      })
    )
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleInsert = () => {
    if (onInsertToEditor) {
      onInsertToEditor(note.content)
    }
  }

  // Paper-like hover animation with slight rotation
  const hoverRotation = Math.random() * 2 - 1 // Random slight rotation between -1 and 1 degrees

  return (
    <motion.div
      layout
      draggable={!isEditing ? "true" : "false"}
      onDragStart={handleDragStart as any}
      onDragEnd={handleDragEnd as any}
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: isDragging ? 0.7 : 1,
        scale: isDragging ? 0.95 : 1,
        y: 0,
        rotate: isDragging ? 3 : 0,
        boxShadow: isDragging
          ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${colors.glow}`
          : note.isKept
          ? `0 8px 25px rgba(0, 0, 0, 0.2), 0 0 20px ${colors.glow}`
          : '0 4px 15px rgba(0, 0, 0, 0.1)',
      }}
      exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, rotate: -5 }}
      whileHover={prefersReducedMotion || isDragging ? {} : {
        y: -6,
        rotate: hoverRotation,
        boxShadow: `0 15px 35px rgba(0, 0, 0, 0.3), 0 0 25px ${colors.glow}`,
      }}
      transition={spring.snappy}
      className={`
        sticky-note relative rounded-lg border p-3 group
        ${colors.bg} ${colors.border} ${colors.hover}
        ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
        ${note.isKept ? 'ring-2 ring-accent-500/50' : ''}
      `}
    >
      {/* Actions - top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-0.5"
            >
              <motion.button
                onClick={handleSave}
                className="p-1 rounded text-green-400 hover:bg-green-900/30 transition-colors"
                whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              >
                <FiCheck className="w-3 h-3" />
              </motion.button>
              <motion.button
                onClick={handleCancel}
                className="p-1 rounded text-neutral-400 hover:bg-primary-700/50 transition-colors"
                whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              >
                <FiX className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-0.5"
            >
              <motion.button
                onClick={onToggleKept}
                className={`p-1 rounded transition-colors ${
                  note.isKept
                    ? 'text-accent-400 hover:bg-accent-700/30'
                    : 'text-neutral-400 hover:text-accent-400 hover:bg-accent-700/20'
                }`}
                title={note.isKept ? 'Remove from keep pile' : 'Keep this idea'}
                whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                animate={note.isKept ? { scale: [1, 1.2, 1] } : {}}
                transition={spring.bouncy}
              >
                <FiBookmark className="w-3 h-3" />
              </motion.button>
              <motion.button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-primary-700/50 transition-colors"
                whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              >
                <FiEdit2 className="w-3 h-3" />
              </motion.button>
              <motion.button
                onClick={handleInsert}
                className="p-1 rounded text-accent-400 hover:bg-accent-700/30 transition-colors"
                title="Insert to editor"
                whileHover={prefersReducedMotion ? {} : { scale: 1.2, x: 2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              >
                <FiArrowRight className="w-3 h-3" />
              </motion.button>
              <motion.button
                onClick={onDelete}
                className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              >
                <FiTrash2 className="w-3 h-3" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className={`${colors.text} text-sm pr-6`}>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing-content"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
            >
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full bg-transparent border-none focus:outline-none resize-none text-inherit"
                autoFocus
              />
            </motion.div>
          ) : (
            <motion.p
              key="content"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              className="leading-relaxed whitespace-pre-wrap"
            >
              {note.content}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Keep indicator */}
      <AnimatePresence>
        {note.isKept && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            transition={spring.bouncy}
            className="absolute bottom-2 left-2"
          >
            <span className="text-[10px] text-accent-400 font-medium uppercase tracking-wide">
              Kept
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default StickyNote
