/**
 * Beat Board commands for slash command system
 * These commands switch the right panel to different Beat Board modes
 */
import { FiGrid, FiZap, FiMessageCircle, FiUsers, FiEye } from 'react-icons/fi'
import type { SlashCommand } from './types'

// Custom event name for mode switching
export const BEATBOARD_MODE_EVENT = 'beatboard:setmode'

// Helper to dispatch mode change event
function switchToBoardMode(mode: string) {
  const event = new CustomEvent(BEATBOARD_MODE_EVENT, { detail: { mode } })
  window.dispatchEvent(event)
}

export const BOARD_COMMANDS: SlashCommand[] = [
  {
    id: 'board-plot',
    name: 'Plot Beats',
    description: 'Open the Story Beats board for plot development',
    category: 'beat-boards',
    keywords: ['plot', 'beats', 'story', 'structure', 'outline', 'act', 'board'],
    icon: FiGrid,
    execute: () => {
      switchToBoardMode('plot')
    },
  },
  {
    id: 'board-brainstorm',
    name: 'Brainstorm Ideas',
    description: 'Open the Ideas board for brainstorming',
    category: 'beat-boards',
    keywords: ['brainstorm', 'ideas', 'creative', 'sticky', 'notes', 'board'],
    icon: FiZap,
    execute: () => {
      switchToBoardMode('brainstorm')
    },
  },
  {
    id: 'board-dialogue',
    name: 'Dialogue Variations',
    description: 'Open the Dialogue board for dialogue alternatives',
    category: 'beat-boards',
    keywords: ['dialogue', 'conversation', 'speech', 'talk', 'variations', 'board'],
    icon: FiMessageCircle,
    execute: () => {
      switchToBoardMode('dialogue')
    },
  },
  {
    id: 'board-characters',
    name: 'Character Profiles',
    description: 'Open the Characters board for character development',
    category: 'beat-boards',
    keywords: ['character', 'profile', 'persona', 'cast', 'protagonist', 'board'],
    icon: FiUsers,
    execute: () => {
      switchToBoardMode('characters')
    },
  },
  {
    id: 'board-analysis',
    name: "Director's Lens",
    description: 'Analyze script for budget, cultural notes, and metrics',
    category: 'beat-boards',
    keywords: ['analysis', 'lens', 'director', 'budget', 'cultural', 'metrics', 'review'],
    icon: FiEye,
    execute: () => {
      switchToBoardMode('analysis')
    },
  },
]
