/**
 * Type definitions for Magic Wand Plugin
 * Inline text transformation system inspired by Sudowrite
 */

import { RangeSelection, LexicalEditor } from 'lexical'
import { IconType } from 'react-icons'

// Serialized selection range for persistence across async operations
export interface SerializedSelectionRange {
  anchorKey: string
  anchorOffset: number
  focusKey: string
  focusOffset: number
}

// Selection state tracking
export interface SelectionState {
  hasSelection: boolean
  text: string
  range: SerializedSelectionRange | null
  position: { x: number; y: number } | null
}

// Workflow state machine
export type WorkflowState = 'idle' | 'menu' | 'sub-options' | 'loading' | 'suggestions'

// Transformation action types
export type TransformationAction = 'rewrite' | 'dialoguetone'

// Sub-option IDs for each action
export type RewriteOption = 'shorten' | 'show-not-tell' | 'intense'
export type DialogueToneOption = 'sarcastic' | 'flirty' | 'threatening' | 'submissive'

export type SubOption = RewriteOption | DialogueToneOption

// Sub-option definition
export interface SubOptionConfig {
  id: SubOption
  label: string
  icon: IconType
  promptModifier: string // Additional instruction to append to prompt
}

// Transformation state
export interface TransformationState {
  activeAction: TransformationAction | null
  selectedOption: SubOption | null
  suggestions: string[]
  isLoading: boolean
}

// Command context for transformation execution
export interface TransformationContext {
  selection: RangeSelection
  text: string
  range: SerializedSelectionRange
}

// Custom Lexical command for triggering transformations from toolbar
export interface TriggerTransformationPayload {
  actionId: TransformationAction
  text: string
}
