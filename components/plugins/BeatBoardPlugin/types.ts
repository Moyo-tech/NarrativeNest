/**
 * BeatBoard Plugin Type Definitions
 * Canvas/board system for ideation tools
 */

// Board modes
export type BoardMode = 'chat' | 'plot' | 'brainstorm' | 'dialogue' | 'characters' | 'analysis'

// Beat/Plot types
export type BeatType = 'setup' | 'confrontation' | 'resolution' | 'climax' | 'inciting-incident' | 'midpoint'

export interface BeatItem {
  id: string
  title: string
  description: string
  actNumber?: 1 | 2 | 3
  beatType?: BeatType
  order: number
}

// Brainstorm types
export type StickyNoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple'

export interface StickyNote {
  id: string
  content: string
  color: StickyNoteColor
  isKept: boolean
  order: number
}

// Dialogue types
export interface DialogueItem {
  id: string
  speaker: string
  dialogue: string
  tone?: string
  context?: string
}

// Character types
export interface CharacterItem {
  id: string
  name: string
  role: string
  motivation: string
  flaw?: string
  secret?: string
  appearance?: string
  voiceNotes?: string
}

// Drag data for editor insertion
export interface BoardDragData {
  type: 'beat' | 'note' | 'dialogue' | 'character'
  id: string
  content: string // Formatted text for editor insertion
}

// Board state
export interface BoardState {
  mode: BoardMode
  isLoading: boolean
  error: string | null

  // Content for each board
  beats: BeatItem[]
  notes: StickyNote[]
  dialogues: DialogueItem[]
  characters: CharacterItem[]

  // Selection context (text selected in editor when board was triggered)
  selectionContext: string

  // Streaming content (raw text while generating)
  streamingContent: string
}

// Board actions for reducer
export type BoardAction =
  | { type: 'SET_MODE'; payload: BoardMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTION_CONTEXT'; payload: string }
  | { type: 'SET_STREAMING_CONTENT'; payload: string }
  | { type: 'APPEND_STREAMING_CONTENT'; payload: string }
  // Beat actions
  | { type: 'SET_BEATS'; payload: BeatItem[] }
  | { type: 'ADD_BEAT'; payload: BeatItem }
  | { type: 'UPDATE_BEAT'; payload: { id: string; updates: Partial<BeatItem> } }
  | { type: 'DELETE_BEAT'; payload: string }
  | { type: 'REORDER_BEATS'; payload: BeatItem[] }
  // Note actions
  | { type: 'SET_NOTES'; payload: StickyNote[] }
  | { type: 'ADD_NOTE'; payload: StickyNote }
  | { type: 'UPDATE_NOTE'; payload: { id: string; updates: Partial<StickyNote> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'TOGGLE_NOTE_KEPT'; payload: string }
  // Dialogue actions
  | { type: 'SET_DIALOGUES'; payload: DialogueItem[] }
  | { type: 'ADD_DIALOGUE'; payload: DialogueItem }
  | { type: 'UPDATE_DIALOGUE'; payload: { id: string; updates: Partial<DialogueItem> } }
  | { type: 'DELETE_DIALOGUE'; payload: string }
  // Character actions
  | { type: 'SET_CHARACTERS'; payload: CharacterItem[] }
  | { type: 'ADD_CHARACTER'; payload: CharacterItem }
  | { type: 'UPDATE_CHARACTER'; payload: { id: string; updates: Partial<CharacterItem> } }
  | { type: 'DELETE_CHARACTER'; payload: string }
  // Reset
  | { type: 'CLEAR_BOARD'; payload: BoardMode }
  | { type: 'RESET_ALL' }

// Context type
export interface BeatBoardContextType {
  state: BoardState
  dispatch: React.Dispatch<BoardAction>
  // Helper functions
  setMode: (mode: BoardMode) => void
  generateContent: (mode: BoardMode, context?: string) => Promise<void>
  clearBoard: (mode: BoardMode) => void
}

// Props for board components
export interface BoardProps {
  onInsertToEditor?: (content: string) => void
}

// Props for individual item components
export interface BeatCardProps {
  beat: BeatItem
  onUpdate: (updates: Partial<BeatItem>) => void
  onDelete: () => void
  isDragging?: boolean
}

export interface StickyNoteProps {
  note: StickyNote
  onUpdate: (updates: Partial<StickyNote>) => void
  onDelete: () => void
  onToggleKept: () => void
  isDragging?: boolean
}

export interface DialogueCardProps {
  dialogue: DialogueItem
  onUpdate: (updates: Partial<DialogueItem>) => void
  onDelete: () => void
  onApply: () => void
  isDragging?: boolean
}

export interface CharacterPassportProps {
  character: CharacterItem
  onUpdate: (updates: Partial<CharacterItem>) => void
  onDelete: () => void
  isDragging?: boolean
}
