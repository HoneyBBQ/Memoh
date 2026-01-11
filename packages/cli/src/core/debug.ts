import { getApiUrl, getToken } from './config'

export interface PingResult {
  success: boolean
  status?: number
  message?: string
  error?: string
}

/**
 * Test API server connection
 */
export async function ping(): Promise<PingResult> {
  const apiUrl = getApiUrl()
  const token = getToken()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${apiUrl}/`, {
      signal: controller.signal,
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const text = await response.text()
      return {
        success: true,
        status: response.status,
        message: text.substring(0, 100),
      }
    } else {
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Connection timeout (5 seconds)',
        }
      }
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: 'Unknown error',
    }
  }
}

/**
 * Get connection info
 */
export function getConnectionInfo(): {
  apiUrl: string
  hasToken: boolean
} {
  return {
    apiUrl: getApiUrl(),
    hasToken: getToken() !== null,
  }
}

