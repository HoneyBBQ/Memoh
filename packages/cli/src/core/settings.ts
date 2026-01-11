import { createClient, requireAuth } from './client'
import type { Settings } from '../types'

export interface UpdateSettingsParams {
  language?: string
  maxContextLoadTime?: number
  defaultChatModel?: string
  defaultSummaryModel?: string
  defaultEmbeddingModel?: string
}

/**
 * Get current user settings
 */
export async function getSettings(): Promise<Settings> {
  requireAuth()
  const client = createClient()

  const response = await client.settings.get()

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch settings')
}

/**
 * Update user settings
 */
export async function updateSettings(params: UpdateSettingsParams): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.settings.put(params)

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (!data?.success) {
    throw new Error('Failed to update settings')
  }
}

