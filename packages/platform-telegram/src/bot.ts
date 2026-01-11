#!/usr/bin/env bun

/**
 * Telegram Bot Standalone Entry Point
 * 
 * This file allows running the Telegram bot as a standalone process
 */

import { TelegramPlatform } from './index'

async function main() {
  const botToken = process.env.BOT_TOKEN
  const redisUrl = process.env.REDIS_URL
  const apiUrl = process.env.API_BASE_URL

  if (!botToken) {
    console.error('❌ BOT_TOKEN environment variable is required')
    process.exit(1)
  }

  console.log('🚀 Starting Telegram bot...')
  console.log(`📡 API URL: ${apiUrl || 'http://localhost:7002'}`)
  console.log(`💾 Redis URL: ${redisUrl || 'redis://localhost:6379'}`)

  const platform = new TelegramPlatform()

  try {
    await platform.start({
      botToken,
      redisUrl,
      apiUrl,
    })

    console.log('✅ Bot is running...')
    console.log('Press Ctrl+C to stop')

    // Graceful shutdown
    process.once('SIGINT', async () => {
      console.log('\n🛑 Stopping bot...')
      await platform.stop()
      process.exit(0)
    })

    process.once('SIGTERM', async () => {
      console.log('\n🛑 Stopping bot...')
      await platform.stop()
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ Failed to start bot:', error)
    process.exit(1)
  }
}

main()

