/**
 * Type definitions for the slash command system
 */
import type { LexicalEditor, RangeSelection, LexicalNode } from 'lexical'
import type { IconType } from 'react-icons'

/**
 * Command category types for organizing commands in the menu
 */
export type CommandCategory =
  | 'basic-blocks'      // Paragraph, headings, quote, code
  | 'formatting'        // Bold, italic, strikethrough
  | 'advanced-blocks'   // Lists, divider, table
  | 'beat-boards'       // Beat Board modes (plot, brainstorm, dialogue, characters)
  | 'ai-actions'        // AI-powered actions (elaborate, rewrite, etc.)

/**
 * Context information passed to command execution functions
 */
export interface CommandContext {
  selection: RangeSelection | null
  anchorNode: LexicalNode
  queryRange: {
    key: string       // Node key where "/" was typed
    offset: number    // Character offset of "/"
  }
}

/**
 * Core slash command definition
 */
export interface SlashCommand {
  /** Unique identifier for the command */
  id: string

  /** Display name shown in the menu */
  name: string

  /** Optional description/subtitle */
  description?: string

  /** Category for grouping in menu */
  category: CommandCategory

  /** Keywords for fuzzy search matching */
  keywords: string[]

  /** Icon component to display */
  icon: IconType

  /**
   * Function to execute when command is selected
   * @param editor - Lexical editor instance
   * @param context - Command execution context
   */
  execute: (editor: LexicalEditor, context: CommandContext) => void

  /**
   * Optional function to determine if command should be shown
   * @param context - Command execution context
   * @returns true if command should be visible
   */
  shouldShow?: (context: CommandContext) => boolean
}
