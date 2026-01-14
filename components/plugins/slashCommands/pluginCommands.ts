/**
 * User plugin commands for the slash command system
 * Converts UserPlugin objects to SlashCommand objects
 */

import type { LexicalEditor } from 'lexical'
import { $getRoot, $getSelection, $isRangeSelection, $isTextNode } from 'lexical'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import type { SlashCommand, CommandContext } from './types'
import type { UserPlugin } from '@/types/plugin'
import {
  FiStar,
  FiZap,
  FiFeather,
  FiEdit3,
  FiMessageCircle,
  FiBookOpen,
  FiUsers,
  FiGlobe,
  FiHeart,
  FiBold,
  FiItalic,
  FiList,
  FiCode,
  FiCoffee,
  FiSun,
  FiMoon,
  FiMusic,
  FiCamera,
  FiFilm,
  FiMic,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

// Icon mapping from string to component
const ICON_MAP: Record<string, IconType> = {
  FiStar,
  FiZap,
  FiFeather,
  FiEdit3,
  FiMessageCircle,
  FiBookOpen,
  FiUsers,
  FiGlobe,
  FiHeart,
  FiBold,
  FiItalic,
  FiList,
  FiCode,
  FiCoffee,
  FiSun,
  FiMoon,
  FiMusic,
  FiCamera,
  FiFilm,
  FiMic,
}

/**
 * Get the icon component for a plugin
 */
function getPluginIcon(iconName: string): IconType {
  return ICON_MAP[iconName] || FiStar
}

/**
 * Get selected text from the editor
 */
function getSelectedText(editor: LexicalEditor): string {
  let selectedText = ''

  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      selectedText = selection.getTextContent()
    }
  })

  return selectedText
}

/**
 * Get full document text
 */
function getDocumentText(editor: LexicalEditor): string {
  let text = ''

  editor.getEditorState().read(() => {
    const root = $getRoot()
    text = root.getTextContent()
  })

  return text
}

/**
 * Create slash commands from user plugins
 */
export function createPluginCommands(
  plugins: UserPlugin[],
  onCreateChat: (task: string, content: string) => void
): SlashCommand[] {
  return plugins.map((plugin) => ({
    id: `plugin-${plugin.id}`,
    name: plugin.name,
    description: plugin.description || undefined,
    category: 'ai-actions' as const,
    keywords: [...plugin.keywords, 'plugin', 'custom'],
    icon: getPluginIcon(plugin.icon),
    execute: (editor: LexicalEditor, context: CommandContext) => {
      // Get selected text or full document
      const selectedText = getSelectedText(editor)
      const content = selectedText || getDocumentText(editor)

      if (!content.trim()) {
        console.warn('No content to process for plugin:', plugin.name)
        return
      }

      // Create a custom action prompt for this plugin
      onCreateChat(`plugin-${plugin.id}`, content)
    },
  }))
}

/**
 * Get plugin action prompt by ID
 * This can be used to get the prompt for a specific plugin when processing
 */
export function getPluginPrompt(plugins: UserPlugin[], actionId: string): string | undefined {
  const pluginId = actionId.replace('plugin-', '')
  const plugin = plugins.find((p) => p.id === pluginId)
  return plugin?.prompt
}
