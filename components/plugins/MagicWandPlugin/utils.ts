/**
 * Utility functions for Magic Wand Plugin
 * Selection capture, restoration, and positioning logic
 */

import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $createRangeSelection,
  $createTextNode,
  LexicalEditor,
  RangeSelection,
} from 'lexical'
import type { SerializedSelectionRange } from './types'

/**
 * Captures the current selection range in a serialized format
 * that can be restored later, even after async operations
 */
export function captureSelection(): SerializedSelectionRange | null {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return null

  return {
    anchorKey: selection.anchor.key,
    anchorOffset: selection.anchor.offset,
    focusKey: selection.focus.key,
    focusOffset: selection.focus.offset,
  }
}

/**
 * Restores a previously captured selection range
 */
export function restoreSelection(range: SerializedSelectionRange): RangeSelection | null {
  try {
    const rangeSelection = $createRangeSelection()
    rangeSelection.anchor.set(range.anchorKey, range.anchorOffset, 'text')
    rangeSelection.focus.set(range.focusKey, range.focusOffset, 'text')
    $setSelection(rangeSelection)
    return rangeSelection
  } catch (error) {
    console.warn('Failed to restore selection:', error)
    return null
  }
}

/**
 * Extracts text content from the current selection
 */
export function getSelectedText(): string {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return ''
  return selection.getTextContent()
}

/**
 * Calculates the position for the Magic Wand icon based on selection
 * Positions to the top-right of the selection
 */
export function calculateWandPosition(selectionRect: DOMRect): { x: number; y: number } {
  const OFFSET_X = 10
  const OFFSET_Y = 40

  return {
    x: selectionRect.right + OFFSET_X,
    y: selectionRect.top - OFFSET_Y + window.scrollY,
  }
}

/**
 * Constrains a position to stay within viewport bounds
 */
export function constrainToViewport(
  position: { x: number; y: number },
  elementWidth: number,
  elementHeight: number
): { x: number; y: number } {
  const PADDING = 20

  return {
    x: Math.max(PADDING, Math.min(position.x, window.innerWidth - elementWidth - PADDING)),
    y: Math.max(PADDING, Math.min(position.y, window.innerHeight - elementHeight - PADDING)),
  }
}

/**
 * Replaces the text at the given selection range with new text
 * This REPLACES the selected text, it does not insert alongside
 */
export function replaceSelectedText(
  editor: LexicalEditor,
  newText: string,
  range: SerializedSelectionRange
): void {
  editor.update(() => {
    try {
      // Restore the selection to the original range
      const selection = restoreSelection(range)

      if (!selection) {
        console.error('Failed to restore selection for replacement')
        return
      }

      // Delete the selected content first, then insert new text
      // This properly REPLACES the text instead of inserting
      selection.removeText()

      // Now insert the new text at the cursor position
      // Using insertText properly replaces inline without creating new paragraphs
      selection.insertText(newText)

    } catch (error) {
      console.error('Failed to replace selected text:', error)

      // Fallback: try simple insertion
      try {
        const fallbackSelection = $getSelection()
        if ($isRangeSelection(fallbackSelection)) {
          fallbackSelection.insertText(newText)
        }
      } catch (fallbackError) {
        console.error('Fallback text insertion also failed:', fallbackError)
      }
    }
  })
}

/**
 * Checks if two selections are different
 */
export function selectionChanged(
  newSelection: unknown,
  oldState: { text: string; range: SerializedSelectionRange | null }
): boolean {
  if (!$isRangeSelection(newSelection)) return true

  const newText = newSelection.getTextContent()
  if (newText !== oldState.text) return true

  if (!oldState.range) return false

  return (
    newSelection.anchor.key !== oldState.range.anchorKey ||
    newSelection.anchor.offset !== oldState.range.anchorOffset ||
    newSelection.focus.key !== oldState.range.focusKey ||
    newSelection.focus.offset !== oldState.range.focusOffset
  )
}

/**
 * Parses AI response into multiple variant suggestions
 * Expected format: "Variant 1---VARIANT---Variant 2---VARIANT---Variant 3"
 */
export function parseVariants(response: string): string[] {
  // Clean up the response - remove any extra whitespace and normalize markers
  const cleanedResponse = response
    .replace(/\n*---VARIANT---\n*/g, '---VARIANT---')
    .trim()

  const variants = cleanedResponse
    .split('---VARIANT---')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)

  // Return up to 3 unique variants
  const uniqueVariants = Array.from(new Set(variants)).slice(0, 3)

  return uniqueVariants
}

/**
 * Gets the current cursor position in viewport coordinates
 */
export function getCursorPosition(): { x: number; y: number } | null {
  const domSelection = window.getSelection()
  if (!domSelection || domSelection.rangeCount === 0) return null

  try {
    const range = domSelection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    return calculateWandPosition(rect)
  } catch (error) {
    console.warn('Failed to get cursor position:', error)
    return null
  }
}
