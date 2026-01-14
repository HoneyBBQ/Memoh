import { createClient, requireAuth } from './client'
import type { MCPConnection, MCPConnectionConfig } from '../types'

export interface CreateMCPConnectionParams {
  name: string
  config: MCPConnectionConfig
  active?: boolean
}

export interface UpdateMCPConnectionParams {
  name?: string
  config?: MCPConnectionConfig
  active?: boolean
}

/**
 * List all MCP connections
 */
export async function listMCPConnections(): Promise<MCPConnection[]> {
  requireAuth()
  const client = createClient()

  const response = await client.mcp.get()

  if (response.error) {
    const errorValue = response.error.value
    if (typeof errorValue === 'string') {
      throw new Error(errorValue)
    } else if (typeof errorValue === 'object' && errorValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = errorValue as any
      const errorMsg = errorObj.error || errorObj.message || JSON.stringify(errorValue)
      throw new Error(errorMsg)
    }
    throw new Error('Failed to fetch MCP connections list')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch MCP connections list')
}

/**
 * Create MCP connection
 */
export async function createMCPConnection(params: CreateMCPConnectionParams): Promise<MCPConnection> {
  requireAuth()
  const client = createClient()

  const payload = {
    name: params.name,
    config: params.config,
    active: params.active ?? true,
  }

  const response = await client.mcp.post(payload)

  if (response.error) {
    const errorValue = response.error.value
    if (typeof errorValue === 'string') {
      throw new Error(errorValue)
    } else if (typeof errorValue === 'object' && errorValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = errorValue as any
      const errorMsg = errorObj.error || errorObj.message || JSON.stringify(errorValue)
      throw new Error(errorMsg)
    }
    throw new Error('Failed to create MCP connection')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to create MCP connection')
}

/**
 * Get MCP connection by ID
 */
export async function getMCPConnection(id: string): Promise<MCPConnection> {
  requireAuth()
  const client = createClient()

  const response = await client.mcp({ id }).get()

  if (response.error) {
    const errorValue = response.error.value
    if (typeof errorValue === 'string') {
      throw new Error(errorValue)
    } else if (typeof errorValue === 'object' && errorValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = errorValue as any
      const errorMsg = errorObj.error || errorObj.message || JSON.stringify(errorValue)
      throw new Error(errorMsg)
    }
    throw new Error('Failed to fetch MCP connection')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as any
  if (data?.success && data?.data) {
    return data.data
  }
  
  throw new Error('Failed to fetch MCP connection')
}

/**
 * Update MCP connection
 */
export async function updateMCPConnection(id: string, params: UpdateMCPConnectionParams): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.mcp({ id }).put(params)

  if (response.error) {
    const errorValue = response.error.value
    if (typeof errorValue === 'string') {
      throw new Error(errorValue)
    } else if (typeof errorValue === 'object' && errorValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = errorValue as any
      const errorMsg = errorObj.error || errorObj.message || JSON.stringify(errorValue)
      throw new Error(errorMsg)
    }
    throw new Error('Failed to update MCP connection')
  }
}

/**
 * Delete MCP connection
 */
export async function deleteMCPConnection(id: string): Promise<void> {
  requireAuth()
  const client = createClient()

  const response = await client.mcp({ id }).delete()

  if (response.error) {
    const errorValue = response.error.value
    if (typeof errorValue === 'string') {
      throw new Error(errorValue)
    } else if (typeof errorValue === 'object' && errorValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = errorValue as any
      const errorMsg = errorObj.error || errorObj.message || JSON.stringify(errorValue)
      throw new Error(errorMsg)
    }
    throw new Error('Failed to delete MCP connection')
  }
}

/**
 * Toggle MCP connection active status
 */
export async function toggleMCPConnection(id: string): Promise<boolean> {
  requireAuth()
  const client = createClient()

  // First get current status
  const getResponse = await client.mcp({ id }).get()

  if (getResponse.error) {
    const errorValue = getResponse.error.value
    if (typeof errorValue === 'string') {
      throw new Error(errorValue)
    } else if (typeof errorValue === 'object' && errorValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = errorValue as any
      const errorMsg = errorObj.error || errorObj.message || JSON.stringify(errorValue)
      throw new Error(errorMsg)
    }
    throw new Error('Failed to get MCP connection')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getData = getResponse.data as any
  if (getData?.success && getData?.data) {
    const currentActive = getData.data.active

    // Update status
    const updateResponse = await client.mcp({ id }).put({
      active: !currentActive,
    })

    if (updateResponse.error) {
      const errorValue = updateResponse.error.value
      if (typeof errorValue === 'string') {
        throw new Error(errorValue)
      } else if (typeof errorValue === 'object' && errorValue !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorObj = errorValue as any
        const errorMsg = errorObj.error || errorObj.message || JSON.stringify(errorValue)
        throw new Error(errorMsg)
      }
      throw new Error('Failed to update MCP connection')
    }

    return !currentActive
  }
  
  throw new Error('Failed to toggle MCP connection status')
}

