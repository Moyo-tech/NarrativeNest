/**
 * Text formatting commands for slash command system
 * Includes: Bold, Italic, Strikethrough
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import {
  BsTypeBold,
  BsTypeItalic,
  BsTypeStrikethrough,
} from 'react-icons/bs'
import type { SlashCommand } from './types'

export const FORMATTING_COMMANDS: SlashCommand[] = [
  {
    id: 'bold',
    name: 'Bold',
    description: 'Make text bold',
    category: 'formatting',
    keywords: ['bold', 'strong', 'b', 'weight', 'thick'],
    icon: BsTypeBold,
    execute: (editor) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
    },
  },
  {
    id: 'italic',
    name: 'Italic',
    description: 'Italicize text',
    category: 'formatting',
    keywords: ['italic', 'italics', 'i', 'em', 'emphasis', 'slant'],
    icon: BsTypeItalic,
    execute: (editor) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
    },
  },
  {
    id: 'strikethrough',
    name: 'Strikethrough',
    description: 'Strike through text',
    category: 'formatting',
    keywords: ['strikethrough', 'strike', 'delete', 'cross', 'line-through'],
    icon: BsTypeStrikethrough,
    execute: (editor) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
    },
  },
]
