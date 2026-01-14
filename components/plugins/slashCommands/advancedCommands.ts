/**
 * Advanced block commands for slash command system
 * Includes: Bulleted List, Numbered List, Divider
 */
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list'
import { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode } from 'lexical'
import { BsListUl, BsListOl } from 'react-icons/bs'
import { FiMinus } from 'react-icons/fi'
import type { SlashCommand } from './types'

export const ADVANCED_COMMANDS: SlashCommand[] = [
  {
    id: 'bulleted-list',
    name: 'Bulleted List',
    description: 'Create an unordered list',
    category: 'advanced-blocks',
    keywords: ['bullet', 'list', 'ul', 'unordered', 'dots', 'bullets'],
    icon: BsListUl,
    execute: (editor) => {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    },
  },
  {
    id: 'numbered-list',
    name: 'Numbered List',
    description: 'Create an ordered list',
    category: 'advanced-blocks',
    keywords: ['number', 'list', 'ol', 'ordered', '123', 'numbered'],
    icon: BsListOl,
    execute: (editor) => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    },
  },
  {
    id: 'divider',
    name: 'Divider',
    description: 'Insert a horizontal line',
    category: 'advanced-blocks',
    keywords: ['divider', 'separator', 'hr', 'line', 'horizontal', 'rule'],
    icon: FiMinus,
    execute: (editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode('---'))
          selection.insertNodes([paragraph])
        }
      })
    },
  },
]
