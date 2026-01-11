import { Elysia } from 'elysia'

export class BasePlatform {
  name: string = 'base'
  description: string = 'Base platform'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async start(config: Record<string, unknown>): Promise<void> {}

  async stop(): Promise<void> {}

  async send(): Promise<void> {}

  // serve(): void {
  //   const app = new Elysia()
  // }
}