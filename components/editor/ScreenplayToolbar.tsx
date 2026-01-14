'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  FiFilm,
  FiUser,
  FiMessageSquare,
  FiFileText,
  FiChevronsRight,
  FiAlignLeft,
} from 'react-icons/fi'
import { $getSelection, $isRangeSelection, FORMAT_ELEMENT_COMMAND } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createParagraphNode, $getRoot, ElementNode } from 'lexical'
import { useCallback, useEffect, useState } from 'react'

export type ScreenplayFormat =
  | 'scene-heading'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'action'
  | 'transition'
  | 'normal'

interface ScreenplayButton {
  format: ScreenplayFormat
  label: string
  icon: React.ComponentType<{ className?: string }>
  tooltip: string
  shortcut: string
}

const screenplayButtons: ScreenplayButton[] = [
  {
    format: 'scene-heading',
    label: 'Scene',
    icon: FiFilm,
    tooltip: 'Scene Heading (INT./EXT.)',
    shortcut: 'Ctrl+Shift+H',
  },
  {
    format: 'character',
    label: 'Character',
    icon: FiUser,
    tooltip: 'Character Name',
    shortcut: 'Ctrl+Shift+C',
  },
  {
    format: 'dialogue',
    label: 'Dialogue',
    icon: FiMessageSquare,
    tooltip: 'Character Dialogue',
    shortcut: 'Ctrl+Shift+D',
  },
  {
    format: 'action',
    label: 'Action',
    icon: FiFileText,
    tooltip: 'Action/Description',
    shortcut: 'Ctrl+Shift+A',
  },
  {
    format: 'transition',
    label: 'Transition',
    icon: FiChevronsRight,
    tooltip: 'Transition',
    shortcut: 'Ctrl+Shift+T',
  },
  {
    format: 'normal',
    label: 'Normal',
    icon: FiAlignLeft,
    tooltip: 'Normal Text',
    shortcut: 'Ctrl+Shift+N',
  },
]

export default function ScreenplayToolbar() {
  const [editor] = useLexicalComposerContext()
  const [activeFormat, setActiveFormat] = useState<ScreenplayFormat>('normal')

  const applyScreenplayFormat = useCallback(
    (format: ScreenplayFormat) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes()

          // Get the paragraph node(s) to format
          nodes.forEach((node) => {
            const parent = node.getParent()
            if (parent) {
              let element = parent as ElementNode

              // Remove all screenplay classes first
              const currentClasses = element.getClassName()
              const cleanedClasses = currentClasses
                .split(' ')
                .filter((cls: string) => !cls.startsWith('screenplay-'))
                .join(' ')

              // Apply new class if not 'normal'
              if (format !== 'normal') {
                element.setClassName(
                  cleanedClasses
                    ? `${cleanedClasses} screenplay-${format}`
                    : `screenplay-${format}`
                )
              } else {
                element.setClassName(cleanedClasses)
              }
            }
          })
        }
      })
      setActiveFormat(format)
    },
    [editor]
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault()
            applyScreenplayFormat('scene-heading')
            break
          case 'c':
            event.preventDefault()
            applyScreenplayFormat('character')
            break
          case 'd':
            event.preventDefault()
            applyScreenplayFormat('dialogue')
            break
          case 'a':
            event.preventDefault()
            applyScreenplayFormat('action')
            break
          case 't':
            event.preventDefault()
            applyScreenplayFormat('transition')
            break
          case 'n':
            event.preventDefault()
            applyScreenplayFormat('normal')
            break
        }
      }

      // Tab key to cycle through formats
      if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey) {
        const currentIndex = screenplayButtons.findIndex(
          (btn) => btn.format === activeFormat
        )
        const nextIndex = (currentIndex + 1) % screenplayButtons.length
        event.preventDefault()
        applyScreenplayFormat(screenplayButtons[nextIndex].format)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [applyScreenplayFormat, activeFormat])

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-primary-700/30 bg-primary-900/50">
      <div className="text-xs font-semibold text-neutral-400 mr-2">
        Screenplay Format:
      </div>
      {screenplayButtons.map((button) => {
        const Icon = button.icon
        const isActive = activeFormat === button.format

        return (
          <button
            key={button.format}
            onClick={() => applyScreenplayFormat(button.format)}
            className={`
              group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? 'bg-accent-700 text-white'
                  : 'text-neutral-300 hover:bg-primary-800 hover:text-white'
              }
            `}
            title={`${button.tooltip} (${button.shortcut})`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{button.label}</span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary-950 text-neutral-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-primary-700/30">
              {button.tooltip}
              <div className="text-neutral-400 text-xs mt-0.5">{button.shortcut}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
