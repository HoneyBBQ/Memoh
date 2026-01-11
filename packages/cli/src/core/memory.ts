import { createClient, requireAuth } from './client'
import type { Memory, Message, MessageListResponse } from '../types'

export interface SearchMemoryParams {
  query: string
  limit?: number
}

export interface AddMemoryParams {
  content: string
}

export interface GetMessagesParams {
  page?: number
  limit?: number
}

export interface FilterMessagesParams {
  startDate: string
  endDate: string
}

/**
 * Search memories
 */
export async function searchMemory(params: SearchMemoryParams): Promise<Memory[]> {
  requireAuth()
  const client = createClient()

  const response = await client.memory.search.get({
    query: {
      q: params.query,
      limit: params.limit || 10,
    },
  })

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Search failed')
}

/**
 * Add memory
 */
export async function addMemory(params: AddMemoryParams): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.memory.post({
    content: params.content,
  })

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (!data?.success) {
    throw new Error('Failed to add memory')
  }
}

/**
 * Get message history
 */
export async function getMessages(params: GetMessagesParams = {}): Promise<MessageListResponse> {
  requireAuth()
  const client = createClient()

  const response = await client.memory.message.get({
    query: {
      page: params.page || 1,
      limit: params.limit || 20,
    },
  })

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch messages')
}

/**
 * Filter messages by date range
 */
export async function filterMessages(params: FilterMessagesParams): Promise<Message[]> {
  requireAuth()
  const client = createClient()

  const response = await client.memory.message.filter.get({
    query: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
  })

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to filter messages')
}

