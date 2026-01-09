import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const model = pgTable('model', {
  id: uuid('id').primaryKey(),
  modelId: text('model_id').notNull(),
  name: text('name'),
  baseUrl: text('base_url').notNull(),
  apiKey: text('api_key').notNull(),
  clientType: text('client_type').notNull()
})