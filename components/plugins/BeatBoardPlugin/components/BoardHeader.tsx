'use client'

import { FiMessageSquare, FiGrid, FiZap, FiMessageCircle, FiUsers, FiEye } from 'react-icons/fi'
import type { BoardMode } from '../types'

interface BoardHeaderProps {
  currentMode: BoardMode
  onModeChange: (mode: BoardMode) => void
}

interface TabConfig {
  id: BoardMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const TABS: TabConfig[] = [
  {
    id: 'chat',
    label: 'Chat',
    icon: FiMessageSquare,
    description: 'AI Copilot',
  },
  {
    id: 'plot',
    label: 'Plot',
    icon: FiGrid,
    description: 'Story Beats',
  },
  {
    id: 'brainstorm',
    label: 'Ideas',
    icon: FiZap,
    description: 'Brainstorm',
  },
  {
    id: 'dialogue',
    label: 'Dialogue',
    icon: FiMessageCircle,
    description: 'Variations',
  },
  {
    id: 'characters',
    label: 'Characters',
    icon: FiUsers,
    description: 'Profiles',
  },
  {
    id: 'analysis',
    label: 'Lens',
    icon: FiEye,
    description: "Director's Lens",
  },
]

export function BoardHeader({ currentMode, onModeChange }: BoardHeaderProps) {
  return (
    <div className="board-header flex-shrink-0 border-b border-primary-700/30 bg-primary-900/50">
      <div className="flex items-center gap-1 p-2 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const isActive = currentMode === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onModeChange(tab.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-accent-700/30 text-accent-300 border border-accent-600/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-primary-800/50 border border-transparent'
                }
              `}
              title={tab.description}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent-400' : ''}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BoardHeader
