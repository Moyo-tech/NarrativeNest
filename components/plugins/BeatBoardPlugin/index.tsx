'use client'

import { useCallback, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection } from 'lexical'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'

import { useBeatBoard, BeatBoardProvider } from '@/context/BeatBoardContext'
import { BoardHeader } from './components/BoardHeader'
import { PlotBoard } from './components/PlotBoard/PlotBoard'
import { BrainstormBoard } from './components/BrainstormBoard/BrainstormBoard'
import { DialogueBoard } from './components/DialogueBoard/DialogueBoard'
import { CharacterBoard } from './components/CharacterBoard/CharacterBoard'
import { DirectorLensPanel } from '@/components/plugins/DirectorLensPlugin'
import CopilotPlugin from '@/components/plugins/CopilotPlugin'
import { BEATBOARD_MODE_EVENT } from '@/components/plugins/slashCommands'
import type { BoardMode } from './types'
import type { Setting, ChatHistory } from '@/types/data'

interface BeatBoardPanelWrapperProps {
  setting: Setting
  history: ChatHistory[]
  onChatUpdate: () => void
}

/**
 * BeatBoardPanelWrapper - Wrapper component that includes the provider
 */
export function BeatBoardPanelWrapper({ setting, history, onChatUpdate }: BeatBoardPanelWrapperProps) {
  return (
    <BeatBoardProvider>
      <BeatBoardPanel setting={setting} history={history} onChatUpdate={onChatUpdate} />
    </BeatBoardProvider>
  )
}

/**
 * BeatBoardPanel - The actual panel content with mode switching
 */
function BeatBoardPanel({ setting, history, onChatUpdate }: BeatBoardPanelWrapperProps) {
  const [editor] = useLexicalComposerContext()
  const { state, setMode, dispatch } = useBeatBoard()
  const { mode } = state

  // Listen for slash command mode switch events
  useEffect(() => {
    const handleModeEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode: string }>
      const newMode = customEvent.detail?.mode as BoardMode
      if (newMode && ['chat', 'plot', 'brainstorm', 'dialogue', 'characters', 'analysis'].includes(newMode)) {
        handleModeChange(newMode)
      }
    }

    window.addEventListener(BEATBOARD_MODE_EVENT, handleModeEvent)
    return () => window.removeEventListener(BEATBOARD_MODE_EVENT, handleModeEvent)
  }, [])

  // Handle mode change - capture selection context when switching to board modes
  const handleModeChange = useCallback(
    (newMode: BoardMode) => {
      if (newMode !== 'chat') {
        // Capture current selection as context
        editor.getEditorState().read(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const selectedText = selection.getTextContent()
            if (selectedText.trim()) {
              dispatch({ type: 'SET_SELECTION_CONTEXT', payload: selectedText })
            }
          } else {
            // If no selection, get some document context
            const root = $getRoot()
            const textContent = root.getTextContent()
            // Take first 500 chars as context
            const context = textContent.substring(0, 500)
            if (context.trim()) {
              dispatch({ type: 'SET_SELECTION_CONTEXT', payload: context })
            }
          }
        })
      }
      setMode(newMode)
    },
    [editor, setMode, dispatch]
  )

  // Insert content to editor
  const handleInsertToEditor = useCallback(
    (content: string) => {
      editor.update(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          // Insert at cursor position
          const paragraphNode = $createParagraphNode()
          $convertFromMarkdownString(content, TRANSFORMERS, paragraphNode)

          // Get nodes from the converted paragraph
          const children = paragraphNode.getChildren()
          if (children.length > 0) {
            selection.insertNodes(children)
          } else {
            // Fallback: insert as plain text
            selection.insertText(content)
          }
        } else {
          // No selection, append to end
          const root = $getRoot()
          const paragraphNode = $createParagraphNode()
          $convertFromMarkdownString(content, TRANSFORMERS, paragraphNode)
          root.append(paragraphNode)
        }
      })

      // Optionally switch back to chat mode after insertion
      // setMode('chat')
    },
    [editor]
  )

  // Render the appropriate board based on mode
  const renderBoard = () => {
    switch (mode) {
      case 'chat':
        return <CopilotPlugin setting={setting} history={history} onChatUpdate={onChatUpdate} />
      case 'plot':
        return <PlotBoard onInsertToEditor={handleInsertToEditor} />
      case 'brainstorm':
        return <BrainstormBoard onInsertToEditor={handleInsertToEditor} />
      case 'dialogue':
        return <DialogueBoard onInsertToEditor={handleInsertToEditor} />
      case 'characters':
        return <CharacterBoard onInsertToEditor={handleInsertToEditor} />
      case 'analysis':
        return <DirectorLensPanel onInsertToEditor={handleInsertToEditor} />
      default:
        return <CopilotPlugin setting={setting} history={history} onChatUpdate={onChatUpdate} />
    }
  }

  return (
    <div className="beat-board-panel flex flex-col h-full">
      <BoardHeader currentMode={mode} onModeChange={handleModeChange} />
      <div className="flex-1 overflow-hidden">{renderBoard()}</div>
    </div>
  )
}

export default BeatBoardPanelWrapper
