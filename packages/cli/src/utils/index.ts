/**
 * Format API error information
 */
export function formatError(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Unknown error'
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (typeof error === 'object') {
    // Try to extract common error fields
    const errorObj = error as Record<string, unknown>
    
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message
    }
    
    if ('error' in errorObj && typeof errorObj.error === 'string') {
      return errorObj.error
    }
    
    // If status and statusText exist
    if ('status' in errorObj && 'statusText' in errorObj) {
      return `${errorObj.status} ${errorObj.statusText}`
    }
    
    // Otherwise return formatted JSON
    try {
      return JSON.stringify(error, null, 2)
    } catch {
      return String(error)
    }
  }
  
  return String(error)
}

