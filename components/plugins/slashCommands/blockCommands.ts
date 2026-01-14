/**
 * Basic block commands for slash command system
 * Includes: Paragraph, Headings (H1-H3), Quote, Code Block
 */
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'
import { $wrapNodes } from '@lexical/selection'
import {
  BsTextParagraph,
  BsTypeH1,
  BsTypeH2,
  BsTypeH3,
  BsQuote,
  BsCode,
} from 'react-icons/bs'
import type { SlashCommand } from './types'

export const BLOCK_COMMANDS: SlashCommand[] = [
  {
    id: 'paragraph',
    name: 'Paragraph',
    description: 'Normal text block',
    category: 'basic-blocks',
    keywords: ['paragraph', 'text', 'normal', 'p'],
    icon: BsTextParagraph,
    execute: (editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode())
        }
      })
    },
  },
  {
    id: 'heading-1',
    name: 'Heading 1',
    description: 'Large section heading',
    category: 'basic-blocks',
    keywords: ['heading', 'h1', 'title', 'large', 'header'],
    icon: BsTypeH1,
    execute: (editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h1'))
        }
      })
    },
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    description: 'Medium section heading',
    category: 'basic-blocks',
    keywords: ['heading', 'h2', 'subtitle', 'medium'],
    icon: BsTypeH2,
    execute: (editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h2'))
        }
      })
    },
  },
  {
    id: 'heading-3',
    name: 'Heading 3',
    description: 'Small section heading',
    category: 'basic-blocks',
    keywords: ['heading', 'h3', 'subheading', 'small'],
    icon: BsTypeH3,
    execute: (editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h3'))
        }
      })
    },
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Block quote',
    category: 'basic-blocks',
    keywords: ['quote', 'blockquote', 'citation', 'cite'],
    icon: BsQuote,
    execute: (editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode())
        }
      })
    },
  },
  {
    id: 'code',
    name: 'Code Block',
    description: 'Code snippet with syntax highlighting',
    category: 'basic-blocks',
    keywords: ['code', 'codeblock', 'snippet', 'programming', 'code-block'],
    icon: BsCode,
    execute: (editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createCodeNode())
        }
      })
    },
  },
]
