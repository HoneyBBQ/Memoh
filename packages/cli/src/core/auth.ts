import { createClient } from './client'
import { setToken, clearToken, getToken, getApiUrl, setApiUrl } from './config'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  success: boolean
  token?: string
  user?: {
    username: string
    role: string
    id: string
  }
}

export interface UserInfo {
  username: string
  role: string
  id: string
}

export interface ConfigInfo {
  apiUrl: string
  loggedIn: boolean
}

/**
 * Login to MemoHome API
 */
export async function login(params: LoginParams): Promise<LoginResult> {
  const client = createClient()
  
  const response = await client.auth.login.post({
    username: params.username,
    password: params.password,
  })

  if (response.error) {
    throw new Error(response.error.value)
  }

  const data = response.data as { success?: boolean; data?: { token?: string; user?: { username: string; role: string } } } | null
  
  if (data?.success && data?.data?.token && data?.data?.user) {
    setToken(data.data.token)
    return {
      success: true,
      token: data.data.token,
      user: data.data.user as UserInfo,
    }
  }
  
  throw new Error('Invalid response format')
}

/**
 * Logout current user
 */
export function logout(): void {
  clearToken()
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return getToken() !== null
}

/**
 * Get current logged in user info
 */
export async function getCurrentUser(): Promise<UserInfo> {
  const token = getToken()
  if (!token) {
    throw new Error('Not logged in')
  }

  const client = createClient()
  const response = await client.auth.me.get()

  if (response.error) {
    throw new Error(response.error.value)
  }

  const data = response.data as { success?: boolean; data?: UserInfo } | null
  
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch user information')
}

/**
 * Get current API configuration
 */
export function getConfig(): ConfigInfo {
  return {
    apiUrl: getApiUrl(),
    loggedIn: isLoggedIn(),
  }
}

/**
 * Set API URL
 */
export function setConfig(apiUrl: string): void {
  setApiUrl(apiUrl)
}

// Re-export config functions for convenience
export { getToken, getApiUrl, setToken, clearToken, setApiUrl }

