import { createClient, requireAuth } from './client'
import type { Schedule } from '../types'

export interface CreateScheduleParams {
  title: string
  description?: string
  cronExpression: string
  enabled: boolean
}

export interface UpdateScheduleParams {
  title?: string
  description?: string
  cronExpression?: string
  enabled?: boolean
}

/**
 * List all schedules
 */
export async function listSchedules(): Promise<Schedule[]> {
  requireAuth()
  const client = createClient()

  const response = await client.schedule.get()

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch scheduled tasks list')
}

/**
 * Create schedule
 */
export async function createSchedule(params: CreateScheduleParams): Promise<Schedule> {
  requireAuth()
  const client = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    title: params.title,
    cronExpression: params.cronExpression,
    enabled: params.enabled,
  }

  if (params.description) {
    payload.description = params.description
  }

  const response = await client.schedule.post(payload)

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to create scheduled task')
}

/**
 * Get schedule by ID
 */
export async function getSchedule(id: string): Promise<Schedule> {
  requireAuth()
  const client = createClient()

  const response = await client.schedule({ id }).get()

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch scheduled task')
}

/**
 * Update schedule
 */
export async function updateSchedule(id: string, params: UpdateScheduleParams): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.schedule({ id }).put(params)

  if (response.error) {
    throw new Error(response.error.value)
  }
}

/**
 * Delete schedule
 */
export async function deleteSchedule(id: string): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.schedule({ id }).delete()

  if (response.error) {
    throw new Error(response.error.value)
  }
}

/**
 * Toggle schedule enabled status
 */
export async function toggleSchedule(id: string): Promise<boolean> {
  requireAuth()
  const client = createClient()

  // First get current status
  const getResponse = await client.schedule({ id }).get()

  if (getResponse.error) {
    throw new Error(getResponse.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getData = getResponse.data as any
  if (getData?.success && getData?.data) {
    const currentEnabled = getData.data.enabled

    // Update status
    const updateResponse = await client.schedule({ id }).put({
      enabled: !currentEnabled,
    })

    if (updateResponse.error) {
      throw new Error(updateResponse.error.value)
    }

    return !currentEnabled
  }
  
  throw new Error('Failed to toggle task status')
}

