/**
 * Central exports for slash command system
 */

// Export all types
export * from './types'

// Export command arrays
export { BLOCK_COMMANDS } from './blockCommands'
export { FORMATTING_COMMANDS } from './formattingCommands'
export { ADVANCED_COMMANDS } from './advancedCommands'
export { BOARD_COMMANDS, BEATBOARD_MODE_EVENT } from './boardCommands'
export { DIALECT_COMMANDS } from './dialectCommands'
export { createAICommands } from './aiCommands'
export { createPluginCommands, getPluginPrompt } from './pluginCommands'

// Utility function for category display names
export function formatCategoryName(category: string): string {
  const map: Record<string, string> = {
    'basic-blocks': 'Basic Blocks',
    'formatting': 'Text Formatting',
    'advanced-blocks': 'Advanced',
    'beat-boards': 'Beat Boards',
    'ai-actions': 'AI Actions',
    'custom': 'Custom Plugins',
  }
  return map[category] || category
}
