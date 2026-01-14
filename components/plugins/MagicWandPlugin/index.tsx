'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  createCommand,
  LexicalCommand,
} from 'lexical'
import { MagicWandIcon } from './MagicWandIcon'
import { TransformationMenu } from './TransformationMenu'
import { SubOptionsMenu } from './SubOptionsMenu'
import { SuggestionCarousel } from './SuggestionCarousel'
import {
  captureSelection,
  getSelectedText,
  getCursorPosition,
  selectionChanged,
  replaceSelectedText,
  parseVariants,
} from './utils'
import type {
  SelectionState,
  WorkflowState,
  TransformationState,
  TransformationAction,
  SubOption,
  TriggerTransformationPayload,
} from './types'

// Custom command for triggering transformations from toolbar
export const TRIGGER_TRANSFORMATION_COMMAND: LexicalCommand<TriggerTransformationPayload> =
  createCommand('TRIGGER_TRANSFORMATION_COMMAND')

// Few-shot examples for Rewrite transformations
const REWRITE_FEW_SHOT_EXAMPLES = {
  shorten: `
EXAMPLES OF SHORTENING TEXT:

Input: "The man walked slowly and carefully across the extremely long and winding road that seemed to stretch on forever into the distance."
Output 1: "The man crept along the endless, winding road."
Output 2: "He walked carefully down the long road."
Output 3: "The man traversed the winding road stretching to the horizon."

Input: "She was feeling extremely happy and overjoyed because she had just received the amazing news that she had gotten the job that she had always wanted."
Output 1: "She was overjoyed—she got her dream job."
Output 2: "Elated, she learned she'd landed her dream job."
Output 3: "She beamed. The job was hers."
`,
  'show-not-tell': `
EXAMPLES OF "SHOW, DON'T TELL":

Input: "John was very angry."
Output 1: "John's jaw clenched. His knuckles whitened around the glass."
Output 2: "A vein throbbed at John's temple. He slammed the door."
Output 3: "John's voice dropped to a whisper, each word clipped and precise."

Input: "The room was messy."
Output 1: "Clothes draped over chairs, empty mugs lined the desk, and papers carpeted the floor."
Output 2: "She kicked aside a pizza box to reach the couch, disturbing a colony of dust bunnies."
Output 3: "Towers of books threatened to topple, and somewhere beneath the chaos, a phone buzzed unanswered."
`,
  intense: `
EXAMPLES OF MAKING TEXT MORE INTENSE:

Input: "She was scared of the dark hallway."
Output 1: "The darkness of the hallway swallowed her whole, each shadow a predator waiting to strike."
Output 2: "Terror seized her throat. The hallway yawned before her—an abyss hungry for souls."
Output 3: "Her heart hammered against her ribs as the hallway's darkness pressed in, suffocating, alive."

Input: "He ran to catch the bus."
Output 1: "His legs burned as he sprinted, lungs screaming, the bus pulling away—his last chance escaping."
Output 2: "He hurled himself forward, muscles tearing, time slowing as the bus doors began to close."
Output 3: "Every fiber of his being ignited. The bus. Now or never. He flew."
`,
}

// Few-shot examples for Dialogue Tone transformations
const DIALOGUE_TONE_FEW_SHOT_EXAMPLES = {
  sarcastic: `
EXAMPLES OF SARCASTIC DIALOGUE:

Input: "That's a good idea."
Output 1: "Oh wow, what a revolutionary thought. Someone alert the Nobel committee."
Output 2: "Brilliant. Absolutely brilliant. Did that take you all day?"
Output 3: "Sure, because that's never been tried before. Groundbreaking."

Input: "Can you help me with this?"
Output 1: "Oh, you need MY help? I'm absolutely shocked. Truly."
Output 2: "Let me just drop everything I'm doing—which is so much less important than your crisis."
Output 3: "Help you? Me? What an unexpected honor."
`,
  flirty: `
EXAMPLES OF FLIRTY DIALOGUE:

Input: "Nice to meet you."
Output 1: "Well, hello there. I was wondering when someone interesting would show up."
Output 2: "The pleasure is definitely mine... and hopefully yours too."
Output 3: "Is it? Because I have a feeling this might be more than just 'nice.'"

Input: "Do you come here often?"
Output 1: "I do now. Seems like I've been coming to the wrong places until tonight."
Output 2: "Not often enough, apparently. I would've remembered you."
Output 3: "Let's just say I have excellent timing... or maybe it's fate."
`,
  threatening: `
EXAMPLES OF THREATENING DIALOGUE:

Input: "I need you to leave."
Output 1: "You have exactly thirty seconds. After that, I can't promise you'll leave on your own feet."
Output 2: "Walk out that door. Now. Unless you want to find out what happens to people who test my patience."
Output 3: "Leave. Or stay and discover why smart people run when they see me coming."

Input: "Give me what I want."
Output 1: "You'll give me what I want. The only question is whether you do it before or after I make you regret being born."
Output 2: "I'm going to count to three. You don't want to hear 'three.'"
Output 3: "Everything has a price. Yours? Your cooperation... or your kneecaps. Choose wisely."
`,
  submissive: `
EXAMPLES OF SUBMISSIVE DIALOGUE:

Input: "I disagree with you."
Output 1: "I... I'm sorry, but I'm not sure I understand. Could you help me see it your way?"
Output 2: "You're probably right. I just... I thought maybe... never mind, it's not important."
Output 3: "Of course you know better. I shouldn't have said anything."

Input: "I want to go home."
Output 1: "If... if it's okay with you? I don't want to be any trouble."
Output 2: "I'm sorry to ask, but... would it be alright if I left? Only if you don't mind."
Output 3: "I know you're busy, and I hate to bother you, but... please?"
`,
}

interface MagicWandPluginProps {
  setting: {
    actionPrompts: Array<{ id: string; name: string; prompt: string }>
    modelId: string
    temperature: number
    globalPrompt: string
  }
}

export default function MagicWandPlugin({ setting }: MagicWandPluginProps) {
  const [editor] = useLexicalComposerContext()

  // Selection tracking state
  const [selectionState, setSelectionState] = useState<SelectionState>({
    hasSelection: false,
    text: '',
    range: null,
    position: null,
  })

  // Workflow state machine
  const [workflowState, setWorkflowState] = useState<WorkflowState>('idle')

  // Transformation state
  const [transformationState, setTransformationState] = useState<TransformationState>({
    activeAction: null,
    selectedOption: null,
    suggestions: [],
    isLoading: false,
  })

  // Store the last used option for regeneration
  const lastOptionRef = useRef<{ option: SubOption | string; customPrompt?: string } | null>(null)

  // Ref to lock selection range during API calls
  const selectionRangeRef = useRef(selectionState.range)

  // Update ref when selection range changes
  useEffect(() => {
    selectionRangeRef.current = selectionState.range
  }, [selectionState.range])

  // Track selection changes
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          try {
            const selection = $getSelection()

            // Check if selection changed
            if (workflowState !== 'idle' && selectionChanged(selection, selectionState)) {
              // Reset workflow if selection changes while menu is open
              setWorkflowState('idle')
              setTransformationState({
                activeAction: null,
                selectedOption: null,
                suggestions: [],
                isLoading: false,
              })
            }

            if (!$isRangeSelection(selection)) {
              setSelectionState({
                hasSelection: false,
                text: '',
                range: null,
                position: null,
              })
              return
            }

            const text = getSelectedText()

            // Only show wand if meaningful text is selected
            if (text.trim().length === 0) {
              setSelectionState({
                hasSelection: false,
                text: '',
                range: null,
                position: null,
              })
              return
            }

            // Capture selection and position
            const range = captureSelection()
            const position = getCursorPosition()

            setSelectionState({
              hasSelection: true,
              text,
              range,
              position,
            })
          } catch (error) {
            console.warn('Selection tracking error:', error)
          }
        })

        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor, workflowState, selectionState])

  // Handle wand icon click
  const handleWandClick = useCallback(() => {
    setWorkflowState('menu')
  }, [])

  // Handle action selection from main menu
  const handleActionSelect = useCallback((action: TransformationAction) => {
    setTransformationState((prev) => ({
      ...prev,
      activeAction: action,
    }))
    setWorkflowState('sub-options')
  }, [])

  // Build the system prompt with few-shot examples
  const buildSystemPrompt = useCallback(
    (action: TransformationAction, option: SubOption | string, customPrompt?: string) => {
      let fewShotExamples = ''
      let taskDescription = ''

      if (option === 'custom') {
        taskDescription = customPrompt || 'Transform the text as requested.'
      } else if (action === 'rewrite') {
        fewShotExamples = REWRITE_FEW_SHOT_EXAMPLES[option as keyof typeof REWRITE_FEW_SHOT_EXAMPLES] || ''
        const rewriteDescriptions: Record<string, string> = {
          shorten: 'Make this text more concise while preserving the core meaning and impact.',
          'show-not-tell': 'Rewrite using vivid sensory details and actions instead of stating emotions directly.',
          intense: 'Amplify the emotional intensity, drama, and urgency of this text.',
        }
        taskDescription = rewriteDescriptions[option] || ''
      } else if (action === 'dialoguetone') {
        fewShotExamples = DIALOGUE_TONE_FEW_SHOT_EXAMPLES[option as keyof typeof DIALOGUE_TONE_FEW_SHOT_EXAMPLES] || ''
        const dialogueDescriptions: Record<string, string> = {
          sarcastic: 'Rewrite this dialogue with biting sarcasm, irony, and wit.',
          flirty: 'Rewrite this dialogue to be playful, charming, and subtly romantic.',
          threatening: 'Rewrite this dialogue to be menacing, intimidating, and dangerous.',
          submissive: 'Rewrite this dialogue to be deferential, apologetic, and yielding.',
        }
        taskDescription = dialogueDescriptions[option] || ''
      }

      return `You are a creative writing assistant specializing in text transformation.

TASK: ${taskDescription}

${fewShotExamples}

CRITICAL INSTRUCTIONS:
1. Provide EXACTLY 3 DIFFERENT variations
2. Each variation MUST be meaningfully different in approach, word choice, and style
3. Separate each variation with the marker "---VARIANT---"
4. Do NOT include the marker within the variations
5. Do NOT number the variations
6. Output ONLY the transformed text, no explanations

Example output format:
[First variation here]
---VARIANT---
[Second variation here - different approach]
---VARIANT---
[Third variation here - another unique take]`
    },
    []
  )

  // Handle sub-option selection
  const handleSubOptionSelect = useCallback(
    async (option: SubOption | string, customPrompt?: string) => {
      // Store for regeneration
      lastOptionRef.current = { option, customPrompt }

      setTransformationState((prev) => ({
        ...prev,
        selectedOption: option as SubOption,
        isLoading: true,
        suggestions: [],
      }))
      setWorkflowState('loading')

      try {
        const action = transformationState.activeAction
        if (!action) throw new Error('No action selected')

        const systemPrompt = buildSystemPrompt(action, option, customPrompt)

        // Call API
        const response = await fetch('/api/writer2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task: action,
            selection: selectionState.text,
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: `Transform this text:\n\n${selectionState.text}`,
              },
            ],
            modelId: setting.modelId,
            temperature: Math.max(setting.temperature, 0.8), // Higher temperature for variety
          }),
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }

        // Handle streaming response
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader available')

        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk

          // Try to parse variants progressively
          const variants = parseVariants(fullText)
          if (variants.length > 0) {
            setTransformationState((prev) => ({
              ...prev,
              suggestions: variants,
            }))
          }
        }

        // Final parse
        const finalVariants = parseVariants(fullText)
        setTransformationState((prev) => ({
          ...prev,
          suggestions: finalVariants.length > 0 ? finalVariants : [fullText.trim()],
          isLoading: false,
        }))
        setWorkflowState('suggestions')
      } catch (error) {
        console.error('Transformation failed:', error)
        setWorkflowState('idle')
        setTransformationState({
          activeAction: null,
          selectedOption: null,
          suggestions: [],
          isLoading: false,
        })
      }
    },
    [transformationState.activeAction, selectionState.text, setting, buildSystemPrompt]
  )

  // Handle suggestion selection - REPLACE the selected text
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      const rangeToUse = selectionRangeRef.current || selectionState.range

      if (!rangeToUse) {
        console.error('No selection range available for replacement')
        return
      }

      // Replace text (this replaces the selected text, not inserts alongside)
      replaceSelectedText(editor, suggestion, rangeToUse)

      // Reset state
      setWorkflowState('idle')
      setTransformationState({
        activeAction: null,
        selectedOption: null,
        suggestions: [],
        isLoading: false,
      })
    },
    [editor, selectionState.range]
  )

  // Handle follow-up request
  const handleFollowUp = useCallback(
    async (instruction: string) => {
      if (!transformationState.activeAction) return

      setTransformationState((prev) => ({
        ...prev,
        isLoading: true,
      }))

      try {
        const systemPrompt = `You are a creative writing assistant. The user wants to further refine text.

Previous suggestions were provided. Now apply this additional instruction:
${instruction}

CRITICAL INSTRUCTIONS:
1. Provide EXACTLY 3 DIFFERENT variations based on the instruction
2. Each variation MUST be meaningfully different
3. Separate each with "---VARIANT---"
4. Output ONLY the transformed text`

        const response = await fetch('/api/writer2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: transformationState.activeAction,
            selection: selectionState.text,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Original text: ${selectionState.text}\n\nInstruction: ${instruction}` },
            ],
            modelId: setting.modelId,
            temperature: 0.8,
          }),
        })

        if (!response.ok) throw new Error('API failed')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader')

        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })
        }

        const variants = parseVariants(fullText)
        setTransformationState((prev) => ({
          ...prev,
          suggestions: variants.length > 0 ? variants : [fullText.trim()],
          isLoading: false,
        }))
      } catch (error) {
        console.error('Follow-up failed:', error)
        setTransformationState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [transformationState.activeAction, selectionState.text, setting]
  )

  // Handle regenerate
  const handleRegenerate = useCallback(() => {
    if (lastOptionRef.current) {
      handleSubOptionSelect(lastOptionRef.current.option, lastOptionRef.current.customPrompt)
    }
  }, [handleSubOptionSelect])

  // Handle menu close
  const handleClose = useCallback(() => {
    setWorkflowState('idle')
    setTransformationState({
      activeAction: null,
      selectedOption: null,
      suggestions: [],
      isLoading: false,
    })
  }, [])

  // Handle back navigation from sub-options
  const handleBack = useCallback(() => {
    setWorkflowState('menu')
    setTransformationState((prev) => ({
      ...prev,
      selectedOption: null,
    }))
  }, [])

  // Register custom command for toolbar integration
  useEffect(() => {
    return editor.registerCommand(
      TRIGGER_TRANSFORMATION_COMMAND,
      (payload: TriggerTransformationPayload) => {
        setTransformationState((prev) => ({
          ...prev,
          activeAction: payload.actionId,
        }))
        setWorkflowState('sub-options')
        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  // Don't render anything if no selection
  if (!selectionState.hasSelection || !selectionState.position) {
    return null
  }

  return (
    <>
      {/* Magic Wand Icon - only show in idle state */}
      {workflowState === 'idle' && (
        <MagicWandIcon
          position={selectionState.position}
          onClick={handleWandClick}
          isVisible={true}
        />
      )}

      {/* Transformation Menu */}
      {workflowState === 'menu' && selectionState.position && (
        <TransformationMenu
          position={selectionState.position}
          onActionSelect={handleActionSelect}
          onClose={handleClose}
        />
      )}

      {/* Sub-Options Menu */}
      {workflowState === 'sub-options' && transformationState.activeAction && selectionState.position && (
        <SubOptionsMenu
          action={transformationState.activeAction}
          position={selectionState.position}
          onOptionSelect={handleSubOptionSelect}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}

      {/* Suggestion Carousel */}
      {(workflowState === 'loading' || workflowState === 'suggestions') && selectionState.position && (
        <SuggestionCarousel
          suggestions={transformationState.suggestions}
          isLoading={transformationState.isLoading}
          onSelectSuggestion={handleSuggestionSelect}
          onClose={handleClose}
          position={selectionState.position}
          onFollowUp={handleFollowUp}
          onRegenerate={handleRegenerate}
        />
      )}
    </>
  )
}
