/**
 * Streaming utility for Server-Sent Events (SSE) consumption
 * Handles real-time text streaming from the backend API
 */

export interface StreamOptions {
  onChunk: (chunk: string) => void
  onComplete?: () => void
  onError?: (error: Error) => void
  signal?: AbortSignal
}

export interface StreamResponse {
  success: boolean
  error?: string
}

/**
 * Consume a streaming response from the backend
 * Parses SSE format and calls onChunk for each text chunk
 */
export async function consumeStream(
  url: string,
  body: Record<string, unknown>,
  options: StreamOptions
): Promise<StreamResponse> {
  const { onChunk, onComplete, onError, signal } = options

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
      signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        // Process any remaining buffer
        if (buffer.trim()) {
          processSSELine(buffer, onChunk)
        }
        break
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })

      // Process complete lines from buffer
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          processSSELine(line, onChunk)
        }
      }
    }

    onComplete?.()
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' }
      }
      onError?.(error)
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Unknown error' }
  }
}

/**
 * Process a single SSE line and extract the data
 */
function processSSELine(line: string, onChunk: (chunk: string) => void) {
  const trimmed = line.trim()

  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith(':')) {
    return
  }

  // Handle "data: " prefix
  if (trimmed.startsWith('data:')) {
    const data = trimmed.slice(5).trim()

    // Check for end signal
    if (data === '[DONE]') {
      return
    }

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(data)
      if (parsed.chunk !== undefined) {
        onChunk(parsed.chunk)
      } else if (parsed.text !== undefined) {
        onChunk(parsed.text)
      } else if (typeof parsed === 'string') {
        onChunk(parsed)
      }
    } catch {
      // If not JSON, use raw data
      onChunk(data)
    }
  }
}

/**
 * Create a streaming text generator hook state
 */
export interface StreamingState {
  text: string
  isStreaming: boolean
  error: string | null
}

/**
 * Helper to create an AbortController that cleans up on unmount
 */
export function createStreamAbortController(): AbortController {
  return new AbortController()
}

/**
 * Stream text generation with automatic state management
 * Returns functions to control the stream
 */
export function createStreamHandler(
  setText: (updater: (prev: string) => string) => void,
  setIsStreaming: (streaming: boolean) => void,
  setError?: (error: string | null) => void
) {
  let abortController: AbortController | null = null

  const start = async (
    url: string,
    body: Record<string, unknown>
  ): Promise<StreamResponse> => {
    // Cancel any existing stream
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    setIsStreaming(true)
    setError?.(null)
    setText(() => '')

    const result = await consumeStream(url, body, {
      onChunk: (chunk) => {
        setText((prev) => prev + chunk)
      },
      onComplete: () => {
        setIsStreaming(false)
      },
      onError: (error) => {
        setError?.(error.message)
        setIsStreaming(false)
      },
      signal: abortController.signal,
    })

    if (!result.success && result.error !== 'Request cancelled') {
      setIsStreaming(false)
    }

    return result
  }

  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      setIsStreaming(false)
    }
  }

  return { start, cancel }
}
