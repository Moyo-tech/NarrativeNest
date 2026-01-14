/**
 * AI command integration for slash command system
 * Dynamically generates commands from existing action prompts
 */
import { $getSelection, $getRoot } from 'lexical'
import { ActionIconMap, type Action } from '@/types/data'
import type { SlashCommand } from './types'

/**
 * Factory function to create AI action slash commands from action prompts
 * @param actionPrompts - Array of action definitions from settings
 * @param onCreateChat - Callback to open chat panel with the selected action
 * @returns Array of slash commands for AI actions
 */
export function createAICommands(
  actionPrompts: Action[],
  onCreateChat: (task: string, content: string) => void
): SlashCommand[] {
  return actionPrompts.map((action) => ({
    id: action.id,
    name: action.name,
    description: 'AI-powered writing assistance',
    category: 'ai-actions',
    keywords: [
      action.id.toLowerCase(),
      action.name.toLowerCase(),
      'ai',
      'assist',
      'help',
      'write',
    ],
    icon: ActionIconMap[action.id as keyof typeof ActionIconMap] || ActionIconMap.custom,
    execute: (editor) => {
      const textContent = editor.getEditorState().read(() => {
        const selection = $getSelection()
        const selectionText = selection?.getTextContent()

        // Use selected text if available, otherwise use full document
        if (selectionText && selectionText.trim() !== '') {
          return selectionText
        }

        // Fallback to full document text
        const root = $getRoot()
        return root.getTextContent()
      })

      // Open chat panel with the action and selected content
      onCreateChat(action.id, textContent)
    },
  }))
}
