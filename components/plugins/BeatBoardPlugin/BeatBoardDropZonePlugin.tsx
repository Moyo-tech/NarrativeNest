'use client'

import { useEffect, useCallback, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from 'lexical'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import type { BoardDragData } from './types'

/**
 * BeatBoardDropZonePlugin
 * Handles drag-and-drop from Beat Board panels into the editor
 */
export function BeatBoardDropZonePlugin() {
  const [editor] = useLexicalComposerContext()
  const [isDragOver, setIsDragOver] = useState(false)

  // Handle drag over
  const handleDragOver = useCallback((event: DragEvent) => {
    // Check if this is a beat board drag
    if (event.dataTransfer?.types.includes('application/x-beatboard-drag')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      setIsDragOver(true)
    }
  }, [])

  // Handle drag leave
  const handleDragLeave = useCallback((event: DragEvent) => {
    // Only set false if we're leaving the editor root
    const rootElement = editor.getRootElement()
    if (rootElement && !rootElement.contains(event.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [editor])

  // Handle drop
  const handleDrop = useCallback(
    (event: DragEvent) => {
      const data = event.dataTransfer?.getData('application/x-beatboard-drag')
      if (!data) return

      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)

      try {
        const dragData: BoardDragData = JSON.parse(data)
        const content = dragData.content

        // Insert content at drop position or cursor
        editor.update(() => {
          const selection = $getSelection()

          if ($isRangeSelection(selection)) {
            // Create a paragraph node and convert markdown content
            const paragraphNode = $createParagraphNode()

            // Try to convert markdown, fallback to plain text
            try {
              $convertFromMarkdownString(content, TRANSFORMERS, paragraphNode)
              const children = paragraphNode.getChildren()
              if (children.length > 0) {
                selection.insertNodes(children)
              } else {
                selection.insertText(content)
              }
            } catch {
              // Fallback: insert as plain text
              selection.insertText(content)
            }
          } else {
            // No selection, append to end of document
            const root = $getRoot()
            const paragraphNode = $createParagraphNode()
            const textNode = $createTextNode(content)
            paragraphNode.append(textNode)
            root.append(paragraphNode)
          }
        })

        // Focus the editor after drop
        editor.focus()
      } catch (error) {
        console.error('Failed to process drop:', error)
      }
    },
    [editor]
  )

  // Register event listeners on the editor root element
  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    rootElement.addEventListener('dragover', handleDragOver)
    rootElement.addEventListener('dragleave', handleDragLeave)
    rootElement.addEventListener('drop', handleDrop)

    return () => {
      rootElement.removeEventListener('dragover', handleDragOver)
      rootElement.removeEventListener('dragleave', handleDragLeave)
      rootElement.removeEventListener('drop', handleDrop)
    }
  }, [editor, handleDragOver, handleDragLeave, handleDrop])

  // Add visual indicator class when dragging over
  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    if (isDragOver) {
      rootElement.classList.add('beatboard-drop-active')
    } else {
      rootElement.classList.remove('beatboard-drop-active')
    }

    return () => {
      rootElement.classList.remove('beatboard-drop-active')
    }
  }, [editor, isDragOver])

  return null
}

export default BeatBoardDropZonePlugin
