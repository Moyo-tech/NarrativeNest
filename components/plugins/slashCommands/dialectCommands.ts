/**
 * Nigerian Dialect Commands for slash command system
 * Transform text into Nigerian dialects and expressions
 */
import { FiGlobe } from 'react-icons/fi'
import type { SlashCommand, CommandContext } from './types'
import type { LexicalEditor } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'

// Dialect prompts for AI transformation
const DIALECT_PROMPTS: Record<string, { name: string; prompt: string; example: string }> = {
  pidgin: {
    name: 'Nigerian Pidgin',
    prompt: `You are an expert in Nigerian Pidgin English. Convert the following text into authentic Nigerian Pidgin while maintaining the original meaning. Use common Pidgin expressions naturally.

Guidelines:
- Use "dey" for continuous actions (e.g., "I dey go" = I am going)
- Use "na" for emphasis (e.g., "na true" = it's true)
- Use "wetin" for "what" (e.g., "wetin happen?" = what happened?)
- Use "wahala" for trouble/problem
- Use "abi" or "shey" for confirmation questions
- Keep it natural and conversational

Only output the converted text, nothing else.`,
    example: 'Bros, wetin dey happen? How body dey?',
  },
  yoruba: {
    name: 'Yoruba-English',
    prompt: `You are an expert in Yoruba language and culture. Convert the following text into English dialogue with authentic Yoruba expressions, greetings, and cultural markers interspersed.

Guidelines:
- Add appropriate Yoruba greetings (E kaaro, E ku irole, E se, etc.)
- Include common Yoruba expressions (Omo, Abi, Ko si wahala, etc.)
- Use Yoruba terms for family (Baba, Mama, Aunty, Uncle, Egbon)
- Include Yoruba exclamations (Oya, Ewo, Ah-ah, etc.)
- Add Yoruba proverbs where appropriate
- Maintain natural code-switching patterns

Only output the converted text, nothing else.`,
    example: 'Ah, Aunty mi! E kaaro o. Omo, this matter don dey vex me.',
  },
  igbo: {
    name: 'Igbo-English',
    prompt: `You are an expert in Igbo language and culture. Convert the following text into English dialogue with authentic Igbo expressions, greetings, and cultural markers interspersed.

Guidelines:
- Add appropriate Igbo greetings (Ndewo, Kedu, Nnoo, Dalu, etc.)
- Include common Igbo expressions (Nna, Chineke, Chimo, Ewoo, etc.)
- Use Igbo terms for family (Nna, Nne, Ada, etc.)
- Include Igbo proverbs and sayings where appropriate
- Reference Igbo customs (kola nut, palm wine, etc.)
- Maintain natural code-switching patterns

Only output the converted text, nothing else.`,
    example: 'Nna, kedu kwanu? Chineke! This thing you are saying...',
  },
  hausa: {
    name: 'Hausa-English',
    prompt: `You are an expert in Hausa language and culture. Convert the following text into English dialogue with authentic Hausa expressions, greetings, and cultural markers interspersed.

Guidelines:
- Add appropriate Hausa greetings (Sannu, Ina kwana, Yaya, etc.)
- Include common Hausa expressions (Wallahi, Kai, Toh, etc.)
- Use Hausa terms for family and respect (Dan'uwa, Yaya, Aboki)
- Include Hausa proverbs where appropriate
- Reference northern Nigerian customs
- Maintain natural code-switching patterns

Only output the converted text, nothing else.`,
    example: 'Kai! Sannu da zuwa. Yaya aiki? Wallahi, this matter no be small.',
  },
  lagos: {
    name: 'Lagos Slang',
    prompt: `You are an expert in modern Lagos street slang and youth expressions. Convert the following text into authentic Lagos street dialogue using current slang and expressions.

Guidelines:
- Use current Lagos slang (Sharp, E choke, Na cruise, On God, etc.)
- Include Gen Z Nigerian expressions (Sapa, Japa, E dey, etc.)
- Use social media influenced language naturally
- Mix English with Pidgin and slang
- Keep it youthful and vibrant
- Reference Lagos locations and lifestyle

Only output the converted text, nothing else.`,
    example: 'Guy, this thing dey mad o! E choke! On God, na cruise we dey.',
  },
}

// Helper to call dialect transformation API
async function transformToDialect(
  editor: LexicalEditor,
  dialect: keyof typeof DIALECT_PROMPTS
): Promise<void> {
  const dialectInfo = DIALECT_PROMPTS[dialect]
  if (!dialectInfo) return

  // Get selected text
  let selectedText = ''
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      selectedText = selection.getTextContent()
    }
  })

  if (!selectedText.trim()) {
    alert('Please select some text to transform into ' + dialectInfo.name)
    return
  }

  try {
    const response = await fetch('/api/writer2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: dialectInfo.prompt },
          { role: 'user', content: selectedText },
        ],
        temperature: 0.7,
        maxTokens: 1000,
      }),
    })

    if (!response.ok) throw new Error('API request failed')

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let result = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      result += decoder.decode(value, { stream: true })
    }
    result += decoder.decode()

    // Replace selected text with transformed text
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertText(result.trim())
      }
    })
  } catch (error) {
    console.error('Dialect transformation failed:', error)
    alert('Failed to transform text. Please try again.')
  }
}

export const DIALECT_COMMANDS: SlashCommand[] = [
  {
    id: 'dialect-pidgin',
    name: 'Nigerian Pidgin',
    description: 'Convert selected text to Nigerian Pidgin',
    category: 'ai-actions',
    keywords: ['pidgin', 'naija', 'dialect', 'convert', 'transform', 'nigeria'],
    icon: FiGlobe,
    execute: (editor: LexicalEditor) => {
      transformToDialect(editor, 'pidgin')
    },
  },
  {
    id: 'dialect-yoruba',
    name: 'Yoruba-English',
    description: 'Add Yoruba expressions to selected text',
    category: 'ai-actions',
    keywords: ['yoruba', 'dialect', 'convert', 'transform', 'nigeria', 'lagos', 'ibadan'],
    icon: FiGlobe,
    execute: (editor: LexicalEditor) => {
      transformToDialect(editor, 'yoruba')
    },
  },
  {
    id: 'dialect-igbo',
    name: 'Igbo-English',
    description: 'Add Igbo expressions to selected text',
    category: 'ai-actions',
    keywords: ['igbo', 'dialect', 'convert', 'transform', 'nigeria', 'eastern'],
    icon: FiGlobe,
    execute: (editor: LexicalEditor) => {
      transformToDialect(editor, 'igbo')
    },
  },
  {
    id: 'dialect-hausa',
    name: 'Hausa-English',
    description: 'Add Hausa expressions to selected text',
    category: 'ai-actions',
    keywords: ['hausa', 'dialect', 'convert', 'transform', 'nigeria', 'northern', 'kano'],
    icon: FiGlobe,
    execute: (editor: LexicalEditor) => {
      transformToDialect(editor, 'hausa')
    },
  },
  {
    id: 'dialect-lagos',
    name: 'Lagos Slang',
    description: 'Convert to modern Lagos street slang',
    category: 'ai-actions',
    keywords: ['lagos', 'slang', 'street', 'genz', 'modern', 'youth', 'dialect'],
    icon: FiGlobe,
    execute: (editor: LexicalEditor) => {
      transformToDialect(editor, 'lagos')
    },
  },
]
