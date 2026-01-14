'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react'
import type {
  BoardState,
  BoardAction,
  BoardMode,
  BeatBoardContextType,
  BeatItem,
  StickyNote,
  DialogueItem,
  CharacterItem,
} from '@/components/plugins/BeatBoardPlugin/types'
import { nanoid } from 'nanoid'

const STORAGE_KEY = 'narrativenest-beatboard-state'

// Initial state
const initialState: BoardState = {
  mode: 'chat',
  isLoading: false,
  error: null,
  beats: [],
  notes: [],
  dialogues: [],
  characters: [],
  selectionContext: '',
}

// Reducer function
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload, error: null }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'SET_SELECTION_CONTEXT':
      return { ...state, selectionContext: action.payload }

    // Beat actions
    case 'SET_BEATS':
      return { ...state, beats: action.payload }

    case 'ADD_BEAT':
      return { ...state, beats: [...state.beats, action.payload] }

    case 'UPDATE_BEAT':
      return {
        ...state,
        beats: state.beats.map((beat) =>
          beat.id === action.payload.id ? { ...beat, ...action.payload.updates } : beat
        ),
      }

    case 'DELETE_BEAT':
      return {
        ...state,
        beats: state.beats.filter((beat) => beat.id !== action.payload),
      }

    case 'REORDER_BEATS':
      return { ...state, beats: action.payload }

    // Note actions
    case 'SET_NOTES':
      return { ...state, notes: action.payload }

    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? { ...note, ...action.payload.updates } : note
        ),
      }

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      }

    case 'TOGGLE_NOTE_KEPT':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload ? { ...note, isKept: !note.isKept } : note
        ),
      }

    // Dialogue actions
    case 'SET_DIALOGUES':
      return { ...state, dialogues: action.payload }

    case 'ADD_DIALOGUE':
      return { ...state, dialogues: [...state.dialogues, action.payload] }

    case 'UPDATE_DIALOGUE':
      return {
        ...state,
        dialogues: state.dialogues.map((d) =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
      }

    case 'DELETE_DIALOGUE':
      return {
        ...state,
        dialogues: state.dialogues.filter((d) => d.id !== action.payload),
      }

    // Character actions
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload }

    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.payload] }

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      }

    case 'DELETE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.payload),
      }

    // Clear/Reset
    case 'CLEAR_BOARD':
      switch (action.payload) {
        case 'plot':
          return { ...state, beats: [] }
        case 'brainstorm':
          return { ...state, notes: [] }
        case 'dialogue':
          return { ...state, dialogues: [] }
        case 'characters':
          return { ...state, characters: [] }
        default:
          return state
      }

    case 'RESET_ALL':
      return initialState

    default:
      return state
  }
}

// Create context
const BeatBoardContext = createContext<BeatBoardContextType | null>(null)

// Provider component
export function BeatBoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsedState = JSON.parse(saved) as Partial<BoardState>
        // Restore only the content, not loading/error states
        if (parsedState.beats?.length) {
          dispatch({ type: 'SET_BEATS', payload: parsedState.beats })
        }
        if (parsedState.notes?.length) {
          dispatch({ type: 'SET_NOTES', payload: parsedState.notes })
        }
        if (parsedState.dialogues?.length) {
          dispatch({ type: 'SET_DIALOGUES', payload: parsedState.dialogues })
        }
        if (parsedState.characters?.length) {
          dispatch({ type: 'SET_CHARACTERS', payload: parsedState.characters })
        }
      }
    } catch (error) {
      console.warn('Failed to load beat board state:', error)
    }
  }, [])

  // Save state to localStorage when content changes
  useEffect(() => {
    try {
      const stateToSave = {
        beats: state.beats,
        notes: state.notes,
        dialogues: state.dialogues,
        characters: state.characters,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.warn('Failed to save beat board state:', error)
    }
  }, [state.beats, state.notes, state.dialogues, state.characters])

  // Helper: Set mode
  const setMode = useCallback((mode: BoardMode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }, [])

  // Helper: Clear board
  const clearBoard = useCallback((mode: BoardMode) => {
    dispatch({ type: 'CLEAR_BOARD', payload: mode })
  }, [])

  // Helper: Generate content for a board (calls API)
  const generateContent = useCallback(
    async (mode: BoardMode, context?: string) => {
      if (mode === 'chat') return

      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      try {
        const prompt = buildPromptForMode(mode, context || state.selectionContext)
        const response = await fetchBoardContent(prompt, mode)

        switch (mode) {
          case 'plot':
            const beats = parseBeatsFromResponse(response)
            dispatch({ type: 'SET_BEATS', payload: beats })
            break
          case 'brainstorm':
            const notes = parseNotesFromResponse(response)
            dispatch({ type: 'SET_NOTES', payload: notes })
            break
          case 'dialogue':
            const dialogues = parseDialoguesFromResponse(response)
            dispatch({ type: 'SET_DIALOGUES', payload: dialogues })
            break
          case 'characters':
            const characters = parseCharactersFromResponse(response)
            dispatch({ type: 'SET_CHARACTERS', payload: characters })
            break
        }

        dispatch({ type: 'SET_LOADING', payload: false })
      } catch (error) {
        console.error('Failed to generate board content:', error)
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to generate content',
        })
      }
    },
    [state.selectionContext]
  )

  const value: BeatBoardContextType = {
    state,
    dispatch,
    setMode,
    generateContent,
    clearBoard,
  }

  return <BeatBoardContext.Provider value={value}>{children}</BeatBoardContext.Provider>
}

// Hook to use the context
export function useBeatBoard(): BeatBoardContextType {
  const context = useContext(BeatBoardContext)
  if (!context) {
    throw new Error('useBeatBoard must be used within a BeatBoardProvider')
  }
  return context
}

// ============================================================================
// Helper Functions - Prompt Building and Parsing
// ============================================================================

function buildPromptForMode(mode: BoardMode, context: string): string {
  const contextSection = context ? `\n\nCONTEXT FROM DOCUMENT:\n${context}\n` : ''

  switch (mode) {
    case 'plot':
      return `You are a story structure expert. Generate a story outline with 6-8 story beats.
${contextSection}
Format your response EXACTLY as follows for each beat (use these exact labels):

BEAT:
TITLE: [Short descriptive title]
ACT: [1, 2, or 3]
TYPE: [One of: setup, inciting-incident, confrontation, midpoint, climax, resolution]
DESCRIPTION: [2-3 sentences describing what happens in this beat]
---END_BEAT---

Generate beats that follow classic three-act structure. Each beat should advance the story logically.`

    case 'brainstorm':
      return `You are a creative brainstorming assistant. Generate 6-8 diverse ideas.
${contextSection}
Format your response EXACTLY as follows for each idea:

IDEA:
COLOR: [One of: YELLOW, PINK, BLUE, GREEN, PURPLE]
CONTENT: [The idea in 1-3 sentences]
---END_IDEA---

Make each idea unique and creative. Use different colors to categorize ideas:
- YELLOW: Plot ideas
- PINK: Character ideas
- BLUE: Setting/world ideas
- GREEN: Dialogue/scene ideas
- PURPLE: Theme/symbolic ideas`

    case 'dialogue':
      return `You are a dialogue writing expert. Generate 4 different dialogue variations.
${contextSection}
Format your response EXACTLY as follows for each variation:

DIALOGUE:
SPEAKER: [Character name or description]
TONE: [e.g., Sarcastic, Warm, Threatening, Playful, etc.]
TEXT: [The actual dialogue - can be multiple lines]
---END_DIALOGUE---

Each variation should express the same core meaning but with different tones, word choices, and personality.`

    case 'characters':
      return `You are a character development expert. Generate 2-3 detailed character profiles.
${contextSection}
Format your response EXACTLY as follows for each character:

CHARACTER:
NAME: [Character's full name]
ROLE: [Their role in the story - protagonist, antagonist, mentor, sidekick, etc.]
MOTIVATION: [What drives this character - their primary goal or desire]
FLAW: [Their main weakness or character flaw]
SECRET: [Something they're hiding or don't want others to know]
APPEARANCE: [Brief physical description]
VOICE: [Notes on how they speak - accent, vocabulary, speech patterns]
---END_CHARACTER---

Create well-rounded characters with depth and clear motivations.`

    default:
      return context
  }
}

async function fetchBoardContent(prompt: string, mode: BoardMode): Promise<string> {
  const response = await fetch('/api/writer2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a creative writing assistant specializing in story development and structure. Always provide complete, well-formatted responses.',
        },
        { role: 'user', content: prompt },
      ],
      modelId: 'gemini-2.0-flash',
      temperature: 0.8,
      maxTokens: 2000, // Higher limit for beat board content generation
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API error:', errorText)
    throw new Error(`API request failed: ${response.statusText}`)
  }

  // The API returns a streaming response, so we need to consume the stream
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    fullContent += decoder.decode(value, { stream: true })
  }

  // Final decode to flush any remaining bytes
  fullContent += decoder.decode()

  console.log('Generated content:', fullContent)
  return fullContent
}

// ============================================================================
// Parsing Functions
// ============================================================================

function parseBeatsFromResponse(response: string): BeatItem[] {
  const beats: BeatItem[] = []
  const beatBlocks = response.split('---END_BEAT---').filter((b) => b.trim())

  beatBlocks.forEach((block, index) => {
    const titleMatch = block.match(/TITLE:\s*(.+?)(?:\n|$)/i)
    const actMatch = block.match(/ACT:\s*(\d)/i)
    const typeMatch = block.match(/TYPE:\s*(.+?)(?:\n|$)/i)
    const descMatch = block.match(/DESCRIPTION:\s*([\s\S]+?)(?=(?:BEAT:|$))/i)

    if (titleMatch) {
      beats.push({
        id: nanoid(),
        title: titleMatch[1].trim(),
        actNumber: actMatch ? (parseInt(actMatch[1]) as 1 | 2 | 3) : 1,
        beatType: typeMatch ? normalizeIBeatType(typeMatch[1].trim()) : 'setup',
        description: descMatch ? descMatch[1].trim() : '',
        order: index,
      })
    }
  })

  return beats
}

function normalizeIBeatType(type: string): BeatItem['beatType'] {
  const normalized = type.toLowerCase().replace(/[^a-z-]/g, '')
  const validTypes: BeatItem['beatType'][] = [
    'setup',
    'confrontation',
    'resolution',
    'climax',
    'inciting-incident',
    'midpoint',
  ]
  return validTypes.includes(normalized as any) ? (normalized as BeatItem['beatType']) : 'setup'
}

function parseNotesFromResponse(response: string): StickyNote[] {
  const notes: StickyNote[] = []
  const noteBlocks = response.split('---END_IDEA---').filter((b) => b.trim())

  noteBlocks.forEach((block, index) => {
    const colorMatch = block.match(/COLOR:\s*(.+?)(?:\n|$)/i)
    const contentMatch = block.match(/CONTENT:\s*([\s\S]+?)(?=(?:IDEA:|$))/i)

    if (contentMatch) {
      const colorStr = colorMatch ? colorMatch[1].trim().toLowerCase() : 'yellow'
      const validColors: StickyNote['color'][] = ['yellow', 'pink', 'blue', 'green', 'purple']
      const color = validColors.includes(colorStr as any) ? (colorStr as StickyNote['color']) : 'yellow'

      notes.push({
        id: nanoid(),
        content: contentMatch[1].trim(),
        color,
        isKept: false,
        order: index,
      })
    }
  })

  return notes
}

function parseDialoguesFromResponse(response: string): DialogueItem[] {
  const dialogues: DialogueItem[] = []
  const dialogueBlocks = response.split('---END_DIALOGUE---').filter((b) => b.trim())

  dialogueBlocks.forEach((block) => {
    const speakerMatch = block.match(/SPEAKER:\s*(.+?)(?:\n|$)/i)
    const toneMatch = block.match(/TONE:\s*(.+?)(?:\n|$)/i)
    const textMatch = block.match(/TEXT:\s*([\s\S]+?)(?=(?:DIALOGUE:|$))/i)

    if (speakerMatch && textMatch) {
      dialogues.push({
        id: nanoid(),
        speaker: speakerMatch[1].trim(),
        tone: toneMatch ? toneMatch[1].trim() : undefined,
        dialogue: textMatch[1].trim(),
      })
    }
  })

  return dialogues
}

function parseCharactersFromResponse(response: string): CharacterItem[] {
  const characters: CharacterItem[] = []
  const charBlocks = response.split('---END_CHARACTER---').filter((b) => b.trim())

  charBlocks.forEach((block) => {
    const nameMatch = block.match(/NAME:\s*(.+?)(?:\n|$)/i)
    const roleMatch = block.match(/ROLE:\s*(.+?)(?:\n|$)/i)
    const motivationMatch = block.match(/MOTIVATION:\s*(.+?)(?:\n|$)/i)
    const flawMatch = block.match(/FLAW:\s*(.+?)(?:\n|$)/i)
    const secretMatch = block.match(/SECRET:\s*(.+?)(?:\n|$)/i)
    const appearanceMatch = block.match(/APPEARANCE:\s*(.+?)(?:\n|$)/i)
    const voiceMatch = block.match(/VOICE:\s*(.+?)(?:\n|$)/i)

    if (nameMatch && roleMatch) {
      characters.push({
        id: nanoid(),
        name: nameMatch[1].trim(),
        role: roleMatch[1].trim(),
        motivation: motivationMatch ? motivationMatch[1].trim() : '',
        flaw: flawMatch ? flawMatch[1].trim() : undefined,
        secret: secretMatch ? secretMatch[1].trim() : undefined,
        appearance: appearanceMatch ? appearanceMatch[1].trim() : undefined,
        voiceNotes: voiceMatch ? voiceMatch[1].trim() : undefined,
      })
    }
  })

  return characters
}

export default BeatBoardContext
