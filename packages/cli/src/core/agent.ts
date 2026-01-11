import { requireAuth, getToken, getApiUrl } from './client'

export interface ChatParams {
  message: string
  maxContextLoadTime?: number
  language?: string
}

export interface StreamEvent {
  type: 'text-delta' | 'tool-call' | 'error' | 'done'
  text?: string
  toolName?: string
  error?: string
}

export type StreamCallback = (event: StreamEvent) => void | Promise<void>

/**
 * Chat with AI Agent (streaming)
 */
export async function chatStream(
  params: ChatParams,
  onEvent: StreamCallback
): Promise<void> {
  requireAuth()
  const token = getToken()!
  const apiUrl = getApiUrl()

  const response = await fetch(`${apiUrl}/agent/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: params.message,
      maxContextLoadTime: params.maxContextLoadTime || 60,
      language: params.language || 'Chinese',
    }),
  })

  if (!response.ok) {
    const errorData = await response.json() as { error?: string }
    throw new Error(errorData.error || 'Chat failed')
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('Unable to read response stream')
  }

  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    buffer += chunk

    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()

        if (data === '[DONE]') {
          await onEvent({ type: 'done' })
          return
        }

        try {
          const event = JSON.parse(data)

          if (event.type === 'text-delta' && event.text) {
            await onEvent({ type: 'text-delta', text: event.text })
          } else if (event.type === 'tool-call') {
            await onEvent({ type: 'tool-call', toolName: event.toolName })
          } else if (event.type === 'error') {
            await onEvent({ type: 'error', error: event.error })
          }
        } catch {
          // Skip unparseable JSON
        }
      }
    }
  }
}

/**
 * Chat with AI Agent (non-streaming, collect full response)
 */
export async function chat(params: ChatParams): Promise<string> {
  let fullResponse = ''
  
  await chatStream(params, async (event) => {
    if (event.type === 'text-delta' && event.text) {
      fullResponse += event.text
    } else if (event.type === 'error') {
      throw new Error(event.error)
    }
  })
  
  return fullResponse
}

