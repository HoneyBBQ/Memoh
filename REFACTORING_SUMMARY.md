# 重构总结文档

## 概述

本次重构将 MemoHome CLI 项目分离成了清晰的两个层次，并实现了 Telegram Bot 的多用户登录鉴权系统。

## 重构目标

1. ✅ **分离关注点**: CLI UI 层和核心业务逻辑完全分离
2. ✅ **可复用性**: Core 层可被任何平台使用（CLI、Telegram、Web 等）
3. ✅ **多存储后端**: 支持不同的存储方式（文件、Redis 等）
4. ✅ **多用户支持**: Telegram bot 支持多个 TG 账号绑定多个 MemoHome 账号

## 架构变化

### 之前 (单体架构)

```
packages/cli/
├── src/
│   ├── client.ts         # 混合了 API 调用和配置管理
│   ├── config.ts         # 硬编码文件存储
│   ├── utils.ts
│   ├── types.ts
│   └── commands/         # CLI 命令直接调用 API
│       ├── auth.ts
│       ├── user.ts
│       └── ...
```

**问题**:
- CLI 和业务逻辑耦合
- 配置硬编码为文件存储
- 无法在其他平台复用
- 单用户设计

### 之后 (分层架构)

```
packages/cli/
├── src/
│   ├── core/                    # 核心业务逻辑（可复用）
│   │   ├── context.ts          # 上下文管理
│   │   ├── storage.ts          # 存储接口定义
│   │   ├── storage/
│   │   │   ├── file.ts         # 文件存储实现
│   │   │   └── index.ts
│   │   ├── client.ts           # API 客户端（支持多种存储）
│   │   ├── auth.ts             # 认证逻辑
│   │   ├── user.ts             # 用户管理
│   │   ├── agent.ts            # AI 对话
│   │   └── ...
│   ├── cli/                     # CLI UI 层
│   │   ├── index.ts            # CLI 入口
│   │   └── commands/           # 命令定义（使用 core）
│   │       ├── auth.ts
│   │       ├── user.ts
│   │       └── ...
│   ├── types/                   # 类型定义
│   └── utils/                   # 工具函数

packages/platform-telegram/       # Telegram 平台
├── src/
│   ├── storage.ts               # Redis 存储实现
│   ├── auth.ts                  # Telegram 认证处理
│   ├── index.ts                 # Bot 实现（使用 cli/core）
│   └── bot.ts                   # 独立启动入口
```

## 核心改进

### 1. 存储抽象层

**接口定义** (`cli/src/core/storage.ts`):

```typescript
export interface TokenStorage {
  getApiUrl(): Promise<string> | string
  setApiUrl(url: string): Promise<void> | void
  getToken(userId?: string): Promise<string | null> | string | null
  setToken(token: string, userId?: string): Promise<void> | void
  clearToken(userId?: string): Promise<void> | void
}
```

**实现**:

1. **FileTokenStorage** (CLI 用)
   - 存储位置: `~/.memohome/config.json`
   - 单用户
   - 同步操作

2. **TelegramRedisStorage** (Telegram Bot 用)
   - 存储位置: Redis
   - 多用户: `memohome:tg:token:{telegram_user_id}`
   - 异步操作
   - 30 天过期

### 2. 上下文管理

**MemoHomeContext** (`cli/src/core/context.ts`):

```typescript
export interface MemoHomeContext {
  storage: TokenStorage      // 存储后端
  currentUserId?: string     // 当前用户 ID（用于多用户场景）
}
```

**使用方式**:

```typescript
// CLI 场景（单用户，文件存储）
import { setContext, FileTokenStorage } from '@memohome/cli/core'

setContext({
  storage: new FileTokenStorage()
})

// Telegram 场景（多用户，Redis 存储）
import { createContext } from '@memohome/cli/core'
import { TelegramRedisStorage } from '@memohome/platform-telegram'

const storage = new TelegramRedisStorage()
const context = createContext({
  storage,
  userId: telegramUserId  // 不同的 TG 用户
})
```

### 3. 同步/异步 API 支持

为了同时支持同步存储（文件）和异步存储（Redis），提供了两套 API：

```typescript
// 同步版本（CLI 用）
export function login(params: LoginParams, context?: MemoHomeContext)
export function isLoggedIn(context?: MemoHomeContext): boolean
export function getToken(context?: MemoHomeContext): string | null

// 异步版本（Telegram Bot 用）
export async function loginAsync(params: LoginParams, context?: MemoHomeContext)
export async function isLoggedInAsync(context?: MemoHomeContext): Promise<boolean>
export async function getTokenAsync(context?: MemoHomeContext): Promise<string | null>
```

### 4. Telegram Bot 多用户架构

**存储结构**:

```
Redis:
  memohome:tg:token:123456 -> "token_abc..."     (Telegram User 123456)
  memohome:tg:user:123456 -> { username, role }
  memohome:tg:token:789012 -> "token_def..."     (Telegram User 789012)
  memohome:tg:user:789012 -> { username, role }
```

**工作流程**:

1. 用户 A (TG ID: 123456) 发送: `/login userA passwordA`
2. Bot 验证 -> 获取 token -> 存储到 Redis: `token:123456`
3. 用户 B (TG ID: 789012) 发送: `/login userB passwordB`
4. Bot 验证 -> 获取 token -> 存储到 Redis: `token:789012`
5. 两个用户独立聊天，使用各自的 token

**鉴权中间件**:

```typescript
bot.command('chat', requireAuth(storage), async (ctx) => {
  // 自动检查用户是否已登录
  // 获取该用户的 token
  // 执行命令
})
```

## 使用示例

### CLI 使用（不变）

```bash
# CLI 仍然使用文件存储
memohome auth login -u admin -p password
memohome agent chat "Hello"
```

### 作为库使用

```typescript
import { login, chat } from '@memohome/cli'

// 默认使用文件存储
await login({ username: 'admin', password: 'password' })
const response = await chat({ message: 'Hello' })
```

### Telegram Bot 使用

```bash
# 配置环境变量
export BOT_TOKEN="your_bot_token"
export REDIS_URL="redis://localhost:6379"
export API_BASE_URL="http://localhost:7002"

# 启动 bot
cd packages/platform-telegram
pnpm start
```

**用户操作**:

```
User A: /login adminA passwordA
Bot: ✅ Login successful! Username: adminA

User B: /login userB passwordB
Bot: ✅ Login successful! Username: userB

User A: 今天天气怎么样？
Bot: 🤖 今天天气...

User B: 讲个笑话
Bot: 🤖 好的，听好了...
```

### 在其他项目中使用 Core

```typescript
import { 
  createContext, 
  loginAsync, 
  chatStreamAsync 
} from '@memohome/cli/core'
import { TelegramRedisStorage } from '@memohome/platform-telegram'

// 创建自定义存储
const storage = new TelegramRedisStorage({
  redisUrl: 'redis://localhost:6379'
})

// 为用户创建上下文
const userContext = createContext({
  storage,
  userId: 'user_12345'
})

// 登录
await loginAsync({
  username: 'user',
  password: 'pass'
}, userContext)

// 聊天
await chatStreamAsync({
  message: 'Hello'
}, async (event) => {
  if (event.type === 'text-delta') {
    console.log(event.text)
  }
}, userContext)
```

## 关键文件清单

### CLI 包

| 文件 | 作用 |
|------|------|
| `src/core/storage.ts` | 存储接口定义 |
| `src/core/storage/file.ts` | 文件存储实现（CLI 用） |
| `src/core/context.ts` | 上下文管理 |
| `src/core/client.ts` | API 客户端（支持上下文） |
| `src/core/auth.ts` | 认证逻辑（同步/异步版本） |
| `src/core/agent.ts` | AI 对话（同步/异步版本） |
| `src/core/index.ts` | 统一导出 |
| `src/cli/commands/*` | CLI 命令（使用 core） |

### Telegram 平台包

| 文件 | 作用 |
|------|------|
| `src/storage.ts` | Redis 存储实现 |
| `src/auth.ts` | Telegram 认证处理器 |
| `src/index.ts` | Bot 主逻辑 |
| `src/bot.ts` | 独立启动入口 |
| `README.md` | 使用文档 |
| `SETUP.md` | 设置指南 |

## 迁移指南

如果你有旧代码需要迁移：

### 旧代码

```typescript
import { createClient, getToken } from './client'
import { loadConfig } from './config'

const client = createClient()
const token = getToken()
```

### 新代码

```typescript
// 方式 1: 使用默认上下文（CLI 场景）
import { createClient, getToken } from '@memohome/cli/core'

const client = createClient()
const token = getToken()

// 方式 2: 使用自定义上下文（多用户场景）
import { createContext, createClientAsync, getTokenAsync } from '@memohome/cli/core'
import { TelegramRedisStorage } from '@memohome/platform-telegram'

const storage = new TelegramRedisStorage()
const context = createContext({ storage, userId: 'user123' })

const client = await createClientAsync(context)
const token = await getTokenAsync(context)
```

## 测试

### CLI 测试

```bash
cd packages/cli
pnpm start auth login -u admin -p password
pnpm start agent chat "Hello"
```

### Telegram Bot 测试

1. 启动 Redis: `redis-server`
2. 启动 API: `cd packages/api && pnpm start`
3. 启动 Bot: `cd packages/platform-telegram && pnpm start`
4. 在 Telegram 中测试:
   - `/start`
   - `/login admin password`
   - `/chat 你好`

## 优势总结

### 1. 关注点分离
- ✅ Core 层: 纯业务逻辑，无 UI 依赖
- ✅ CLI 层: 只负责用户交互
- ✅ Platform 层: 平台特定实现

### 2. 可扩展性
- ✅ 轻松添加新的存储后端
- ✅ 轻松添加新的平台（Web、Desktop、Discord 等）
- ✅ 轻松添加新功能到 core

### 3. 可测试性
- ✅ Core 层可独立测试，无需模拟 UI
- ✅ Storage 可以 mock
- ✅ Context 可以独立创建

### 4. 多用户支持
- ✅ Telegram bot 支持多个用户同时使用
- ✅ 每个用户独立的 session
- ✅ Token 自动管理和过期

### 5. 类型安全
- ✅ 完整的 TypeScript 类型定义
- ✅ 导出所有类型供外部使用

## 未来扩展

基于这个架构，可以轻松添加：

1. **Discord Bot**
   ```typescript
   // packages/platform-discord
   import { createContext, loginAsync } from '@memohome/cli/core'
   import { DiscordRedisStorage } from './storage'
   
   const storage = new DiscordRedisStorage()
   // 类似 Telegram 实现
   ```

2. **Web 应用**
   ```typescript
   // packages/web
   import { createContext, loginAsync, chatStreamAsync } from '@memohome/cli/core'
   import { BrowserStorage } from './storage'
   
   const storage = new BrowserStorage() // localStorage
   // 在 React/Vue 中使用
   ```

3. **移动应用**
   ```typescript
   // packages/mobile
   import { createContext } from '@memohome/cli/core'
   import { SecureStorage } from './storage'
   
   const storage = new SecureStorage() // React Native AsyncStorage
   ```

## 总结

本次重构实现了：

1. ✅ **完全分离** CLI 和 Core 层
2. ✅ **抽象存储** 支持多种后端
3. ✅ **多用户支持** Telegram bot 可服务多个用户
4. ✅ **同步/异步** API 适配不同场景
5. ✅ **可扩展** 易于添加新平台和功能
6. ✅ **文档完善** README、SETUP、示例齐全

现在你可以：
- 继续使用 CLI（体验不变）
- 启动 Telegram bot 服务多个用户
- 在其他项目中复用 Core 功能
- 轻松添加新的平台支持

