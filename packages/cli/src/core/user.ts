import { createClient, requireAuth } from './client'
import type { User } from '../types'

export interface CreateUserParams {
  username: string
  password: string
  role: string
}

export interface UpdatePasswordParams {
  userId: string
  password: string
}

/**
 * List all users
 */
export async function listUsers(): Promise<User[]> {
  requireAuth()
  const client = createClient()

  const response = await client.user.get()

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch user list')
}

/**
 * Create new user
 */
export async function createUser(params: CreateUserParams): Promise<User> {
  requireAuth()
  const client = createClient()

  const response = await client.user.post({
    username: params.username,
    password: params.password,
    role: params.role,
  })

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to create user')
}

/**
 * Get user by ID
 */
export async function getUser(id: string): Promise<User> {
  requireAuth()
  const client = createClient()

  const response = await client.user({ id }).get()

  if (response.error) {
    throw new Error(response.error.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch user information')
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.user({ id }).delete()

  if (response.error) {
    throw new Error(response.error.value)
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(params: UpdatePasswordParams): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.user({ id: params.userId }).password.patch({
    password: params.password,
  })

  if (response.error) {
    throw new Error(response.error.value)
  }
}

