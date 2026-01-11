import { app } from './index'
import { treaty } from '@elysiajs/eden'

export type ApiClient = typeof app

export const createClient = (
  baseUrl: string = process.env.API_BASE_URL ?? 'http://localhost:7002',
  token?: string,
) => {
  return treaty<ApiClient>(baseUrl, {
    headers: token ? {
      'Authorization': `Bearer ${token}`,
    } : undefined,
  })
}