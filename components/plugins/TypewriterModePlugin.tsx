'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical'

interface TypewriterModePluginProps {
  enabled: boolean
}

export default function TypewriterModePlugin({ enabled }: TypewriterModePluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) return

    const scrollToCursor = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        // Get the DOM element for the cursor position
        const nativeSelection = window.getSelection()
        if (!nativeSelection || nativeSelection.rangeCount === 0) return

        const range = nativeSelection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        // Find the scrollable container
        const editorElement = editor.getRootElement()
        const scrollContainer = editorElement?.closest('.overflow-y-auto')

        if (!scrollContainer || !rect) return

        // Calculate the center position
        const containerRect = scrollContainer.getBoundingClientRect()
        const containerCenter = containerRect.height / 2
        const cursorRelativeTop = rect.top - containerRect.top

        // Scroll to keep cursor centered
        const scrollOffset = cursorRelativeTop - containerCenter

        if (Math.abs(scrollOffset) > 50) {
          // Only scroll if cursor is more than 50px away from center
          scrollContainer.scrollBy({
            top: scrollOffset,
            behavior: 'smooth',
          })
        }
      })
    }

    // Register selection change listener
    const removeListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        scrollToCursor()
        return false
      },
      1
    )

    // Also scroll on initial mount if enabled
    scrollToCursor()

    return () => {
      removeListener()
    }
  }, [editor, enabled])

  return null
}
