'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $createParagraphNode } from 'lexical'
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { useEffect, useRef, useState, useCallback } from 'react'
import { HiUser } from 'react-icons/hi2'
import { FiSend, FiZap, FiTrash2, FiCopy, FiCheck, FiFileText } from 'react-icons/fi'
import Markdown from '../Markdown/Markdown'
import type { Setting } from '@/types/data'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface CopilotPluginProps {
  setting: Setting
  history?: any[] // Keep for compatibility but not used
  onChatUpdate?: () => void // Keep for compatibility but not used
}

const STORAGE_KEY = 'narrativenest-chat-history'

export default function CopilotPlugin({ setting }: CopilotPluginProps) {
  const [editor] = useLexicalComposerContext()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setMessages(parsed)
        }
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error)
    }
  }, [])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (error) {
        console.warn('Failed to save chat history:', error)
      }
    }
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px'
      const scrollHeight = Math.min(textAreaRef.current.scrollHeight, 150)
      textAreaRef.current.style.height = scrollHeight + 'px'
    }
  }, [input])

  // Get document context
  const getDocumentContext = useCallback(() => {
    let context = ''
    editor.getEditorState().read(() => {
      context = $convertToMarkdownString(TRANSFORMERS)
    })
    return context.substring(0, 2000) // Limit context size
  }, [editor])

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Get document context for the AI
      const documentContext = getDocumentContext()

      // Build messages for API
      const apiMessages = [
        {
          role: 'system',
          content: `${setting.globalPrompt || 'You are a helpful creative writing assistant.'}

You are helping a writer with their work. Be concise, helpful, and creative.
If the user asks about their document, here is the current content:

---
${documentContext || '(Document is empty)'}
---

Provide thoughtful suggestions, answer questions about writing craft, help with ideas, and assist with any writing-related tasks.`,
        },
        ...newMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ]

      const response = await fetch('/api/writer2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          temperature: setting.temperature || 0.7,
          maxTokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Stream the response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantId = `msg-${Date.now()}-assistant`

      // Add placeholder for assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value, { stream: true })

        // Update assistant message with streamed content
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
        )
      }

      // Final decode
      assistantContent += decoder.decode()
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
      )
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Insert text into editor
  const insertToEditor = (text: string) => {
    editor.update(() => {
      const root = $getRoot()
      const paragraphNode = $createParagraphNode()
      $convertFromMarkdownString(text, TRANSFORMERS, paragraphNode)
      root.append(paragraphNode)
      root.append($createParagraphNode())
    })
  }

  // Copy text to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Clear chat history
  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="h-full flex flex-col bg-primary-950">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-primary-700/30 bg-primary-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-700/20 flex items-center justify-center">
              <FiZap className="w-4 h-4 text-accent-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Writing Assistant</h3>
              <p className="text-xs text-neutral-400">Free-form chat</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Clear chat history"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-700/10 flex items-center justify-center mb-4">
              <FiZap className="w-8 h-8 text-accent-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-2">Writing Assistant</h3>
            <p className="text-sm text-neutral-400 max-w-xs mb-4">
              Ask me anything about your writing. I can help with:
            </p>
            <ul className="text-sm text-neutral-500 space-y-1 text-left">
              <li>- General writing questions</li>
              <li>- Help with paragraphs or scenes</li>
              <li>- Brainstorming ideas</li>
              <li>- Feedback on your work</li>
              <li>- Writing tips and techniques</li>
            </ul>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0">
                  {msg.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full bg-accent-700/20 flex items-center justify-center">
                      <FiZap className="w-4 h-4 text-accent-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-700/30 flex items-center justify-center">
                      <HiUser className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div
                  className={`flex-1 min-w-0 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block p-3 rounded-xl break-words overflow-hidden max-w-full ${
                      msg.role === 'user'
                        ? 'bg-accent-700/30 text-white'
                        : 'bg-primary-800/50 text-neutral-200'
                    }`}
                  >
                    <Markdown content={msg.content} />
                  </div>
                  {msg.role === 'assistant' && msg.content && (
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1.5 rounded text-neutral-500 hover:text-neutral-300 hover:bg-primary-800/50 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <FiCheck className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <FiCopy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => insertToEditor(msg.content)}
                        className="p-1.5 rounded text-neutral-500 hover:text-neutral-300 hover:bg-primary-800/50 transition-colors"
                        title="Insert into editor"
                      >
                        <FiFileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-primary-700/30 bg-primary-900/30">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask about your writing..."
              className="w-full rounded-xl bg-primary-800/50 border border-primary-700/30 px-4 py-3 pr-12 text-neutral-200 placeholder-neutral-500 outline-none focus:border-accent-600/50 focus:ring-2 focus:ring-accent-600/20 transition-all resize-none"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 rounded-lg text-accent-400 hover:bg-accent-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
