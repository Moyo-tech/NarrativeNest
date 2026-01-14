'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $createParagraphNode,
} from 'lexical'
import { SlashCommandMenu } from './SlashCommandMenu'
import {
  BLOCK_COMMANDS,
  FORMATTING_COMMANDS,
  ADVANCED_COMMANDS,
  BOARD_COMMANDS,
  DIALECT_COMMANDS,
  createAICommands,
  createPluginCommands,
  type SlashCommand,
  type CommandContext,
} from './slashCommands'
import type { Setting } from '@/types/data'
import type { UserPlugin } from '@/types/plugin'

interface SlashCommandState {
  isOpen: boolean
  query: string
  selectedIndex: number
  filteredCommands: SlashCommand[]
  anchorOffset: number
  anchorKey: string
}

interface SlashCommandPluginProps {
  setting: Setting
  onCreateChat: (task: string, content: string) => void
  userPlugins?: UserPlugin[]
}

export default function SlashCommandPlugin({
  setting,
  onCreateChat,
  userPlugins = [],
}: SlashCommandPluginProps) {
  const [editor] = useLexicalComposerContext()

  const [state, setState] = useState<SlashCommandState>({
    isOpen: false,
    query: '',
    selectedIndex: 0,
    filteredCommands: [],
    anchorOffset: 0,
    anchorKey: '',
  })

  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  // Build complete command list including AI commands, board commands, dialect commands, and user plugins
  const allCommands = useMemo(() => {
    const aiCommands = createAICommands(setting.actionPrompts, onCreateChat)
    const enabledPlugins = userPlugins.filter((p) => p.enabled)
    const pluginCommands = createPluginCommands(enabledPlugins, onCreateChat)
    return [
      ...BLOCK_COMMANDS,
      ...FORMATTING_COMMANDS,
      ...ADVANCED_COMMANDS,
      ...BOARD_COMMANDS,
      ...DIALECT_COMMANDS,
      ...aiCommands,
      ...pluginCommands,
    ]
  }, [setting.actionPrompts, onCreateChat, userPlugins])

  // Filter commands based on query
  const filterCommands = useCallback(
    (query: string): SlashCommand[] => {
      if (!query || query.trim() === '') {
        return allCommands
      }

      const lowerQuery = query.toLowerCase().trim()
      return allCommands.filter(
        (cmd) =>
          cmd.keywords.some((kw) => kw.includes(lowerQuery)) ||
          cmd.name.toLowerCase().includes(lowerQuery) ||
          cmd.description?.toLowerCase().includes(lowerQuery)
      )
    },
    [allCommands]
  )

  // Remove slash trigger and query text from editor - improved version
  const removeSlashTrigger = useCallback(() => {
    editor.update(() => {
      try {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const anchor = selection.anchor
        const focus = selection.focus
        const anchorNode = anchor.getNode()

        if (!$isTextNode(anchorNode)) return

        const textContent = anchorNode.getTextContent()
        const currentOffset = anchor.offset

        // Find the last "/" before current position
        const slashIndex = textContent.lastIndexOf('/', currentOffset)

        if (slashIndex !== -1) {
          // Split text: before slash, and after current position
          const before = textContent.substring(0, slashIndex)
          const after = textContent.substring(currentOffset)

          // Update text content
          anchorNode.setTextContent(before + after)

          // Restore selection at slash position
          anchor.set(anchorNode.getKey(), slashIndex, 'text')
          focus.set(anchorNode.getKey(), slashIndex, 'text')
        }
      } catch (error) {
        // Silently handle errors from deleted nodes
        console.warn('Failed to remove slash trigger:', error)
      }
    })
  }, [editor])

  // Execute selected command
  const executeCommand = useCallback(
    (command: SlashCommand) => {
      // First remove the slash trigger text
      removeSlashTrigger()

      // Then execute the command in a separate update
      setTimeout(() => {
        editor.update(() => {
          try {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) {
              // If no selection, create a new paragraph
              const paragraph = $createParagraphNode()
              selection?.insertNodes([paragraph])
              return
            }

            const context: CommandContext = {
              selection,
              anchorNode: selection.anchor.getNode(),
              queryRange: {
                key: state.anchorKey,
                offset: state.anchorOffset,
              },
            }

            command.execute(editor, context)
          } catch (error) {
            console.warn('Failed to execute command:', error)
          }
        })
      }, 10)

      // Close menu
      setState((s) => ({
        ...s,
        isOpen: false,
        query: '',
        selectedIndex: 0,
      }))
    },
    [editor, state, removeSlashTrigger]
  )

  // Handle keyboard navigation within menu
  useEffect(() => {
    if (!state.isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setState((s) => ({
            ...s,
            selectedIndex: Math.min(
              s.selectedIndex + 1,
              s.filteredCommands.length - 1
            ),
          }))
          break

        case 'ArrowUp':
          event.preventDefault()
          setState((s) => ({
            ...s,
            selectedIndex: Math.max(s.selectedIndex - 1, 0),
          }))
          break

        case 'Enter':
        case 'Tab':
          event.preventDefault()
          const cmd = state.filteredCommands[state.selectedIndex]
          if (cmd) {
            executeCommand(cmd)
          }
          break

        case 'Escape':
          event.preventDefault()
          setState((s) => ({
            ...s,
            isOpen: false,
            query: '',
            selectedIndex: 0,
          }))
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [state.isOpen, state.filteredCommands, state.selectedIndex, executeCommand])

  // Main slash command detection and query tracking
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        try {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) return false

          // Detect "/" key press
          if (event.key === '/' && !state.isOpen) {
            const anchor = selection.anchor
            const node = anchor.getNode()
            const offset = anchor.offset

            // Only trigger at start of line or after space/newline
            const textContent = node.getTextContent()
            const charBefore = textContent[offset - 1]

            const shouldTrigger =
              offset === 0 ||
              charBefore === ' ' ||
              charBefore === '\n' ||
              charBefore === undefined

            if (shouldTrigger) {
              // Calculate menu position
              const domSelection = window.getSelection()
              if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0)
                const rect = range.getBoundingClientRect()

                setMenuPosition({
                  x: rect.left,
                  y: rect.bottom + window.scrollY + 5,
                })
              }

              // Open menu with all commands
              setState({
                isOpen: true,
                query: '',
                selectedIndex: 0,
                filteredCommands: allCommands,
                anchorOffset: offset + 1,
                anchorKey: node.getKey(),
              })
            }

            return false
          }

          // Update query as user types after "/"
          if (
            state.isOpen &&
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            // Use setTimeout to allow character to be inserted first
            setTimeout(() => {
              editor.getEditorState().read(() => {
                try {
                  const sel = $getSelection()
                  if (!$isRangeSelection(sel)) return

                  const node = sel.anchor.getNode()
                  if (!$isTextNode(node)) return

                  const text = node.getTextContent()
                  const currentOffset = sel.anchor.offset

                  // Find the "/" before current position
                  const slashIndex = text.lastIndexOf('/', currentOffset)

                  if (slashIndex !== -1) {
                    const query = text.substring(slashIndex + 1, currentOffset)
                    const filtered = filterCommands(query)

                    setState((s) => ({
                      ...s,
                      query,
                      filteredCommands: filtered,
                      selectedIndex: 0,
                    }))
                  }
                } catch (error) {
                  // Silently handle errors from modified nodes
                }
              })
            }, 0)
          }

          // Close menu on backspace if we've deleted the "/"
          if (state.isOpen && event.key === 'Backspace') {
            setTimeout(() => {
              editor.getEditorState().read(() => {
                try {
                  const sel = $getSelection()
                  if (!$isRangeSelection(sel)) return

                  const node = sel.anchor.getNode()
                  if (!$isTextNode(node)) return

                  const text = node.getTextContent()
                  const currentOffset = sel.anchor.offset

                  // Check if "/" still exists before cursor
                  const slashIndex = text.lastIndexOf('/', currentOffset)

                  if (slashIndex === -1 || slashIndex < state.anchorOffset - 1) {
                    setState((s) => ({ ...s, isOpen: false, query: '', selectedIndex: 0 }))
                  }
                } catch (error) {
                  // Close menu on error
                  setState((s) => ({ ...s, isOpen: false, query: '', selectedIndex: 0 }))
                }
              })
            }, 0)
          }
        } catch (error) {
          // Silently handle any errors
          console.warn('Slash command error:', error)
        }

        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor, state, allCommands, filterCommands])

  // Close menu when clicking outside
  useEffect(() => {
    if (!state.isOpen) return

    const handleClick = () => {
      setState((s) => ({ ...s, isOpen: false, query: '', selectedIndex: 0 }))
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClick)
    }
  }, [state.isOpen])

  if (!state.isOpen) {
    return null
  }

  return (
    <SlashCommandMenu
      commands={state.filteredCommands}
      selectedIndex={state.selectedIndex}
      onSelect={executeCommand}
      position={menuPosition}
      query={state.query}
    />
  )
}
