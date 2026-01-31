import { tool } from 'ai'
import { z } from 'zod'
import { AgentAction, createAgent } from '../agent'
import { BaseModelConfig } from '../types'
import { AuthFetcher } from '..'

export interface SubagentToolParams extends BaseModelConfig {
  fetch: AuthFetcher
  braveApiKey?: string
  braveBaseUrl?: string
}

export const getSubagentTools = ({ fetch, apiKey, baseUrl, model, clientType, braveApiKey, braveBaseUrl }: SubagentToolParams) => {
  const createSubagent = tool({
    description: 'Create a new subagent',
    inputSchema: z.object({
      name: z.string(),
      description: z.string(),
    }),
    execute: async ({ name, description }) => {
      return {
        success: true,
        message: 'Subagent created successfully',
      }
    },
  })

  const querySubagent = tool({
    description: 'Query a subagent',
    inputSchema: z.object({
      name: z.string(),
      query: z.string().describe('The prompt to ask the subagent to do.'),
    }),
    execute: async ({ name, query }) => {
      const { askAsSubagent } = createAgent({
        apiKey,
        baseUrl,
        model,
        clientType,
        braveApiKey,
        braveBaseUrl,
        allowed: [
          AgentAction.WebSearch,
        ]
      })
      const result = await askAsSubagent({
        messages: [],
        query,
      }, { name })
      return {
        success: true,
        result: result.messages[result.messages.length - 1].content,
      }
    },
  })

  return {
    'create_subagent': createSubagent,
    'query_subagent': querySubagent,
  }
}