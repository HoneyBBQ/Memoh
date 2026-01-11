/**
 * MemoHome Core API
 * 
 * This module provides core functionality that can be used by CLI and other applications.
 * All functions are independent of CLI-specific UI concerns (no chalk, ora, inquirer, etc.)
 */

// Auth
export {
  login,
  logout,
  isLoggedIn,
  getCurrentUser,
  getConfig,
  setConfig,
  getToken,
  getApiUrl,
  setToken,
  clearToken,
  setApiUrl,
  type LoginParams,
  type LoginResult,
  type UserInfo,
  type ConfigInfo,
} from './auth'

// User
export {
  listUsers,
  createUser,
  getUser,
  deleteUser,
  updateUserPassword,
  type CreateUserParams,
  type UpdatePasswordParams,
} from './user'

// Model
export {
  listModels,
  createModel,
  getModel,
  deleteModel,
  getDefaultModels,
  type CreateModelParams,
  type ModelListItem,
} from './model'

// Agent
export {
  chat,
  chatStream,
  type ChatParams,
  type StreamEvent,
  type StreamCallback,
} from './agent'

// Memory
export {
  searchMemory,
  addMemory,
  getMessages,
  filterMessages,
  type SearchMemoryParams,
  type AddMemoryParams,
  type GetMessagesParams,
  type FilterMessagesParams,
} from './memory'

// Schedule
export {
  listSchedules,
  createSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
  type CreateScheduleParams,
  type UpdateScheduleParams,
} from './schedule'

// Settings
export {
  getSettings,
  updateSettings,
  type UpdateSettingsParams,
} from './settings'

// Debug
export {
  ping,
  getConnectionInfo,
  type PingResult,
} from './debug'

// Config
export {
  loadConfig,
  saveConfig,
  ensureConfigDir,
  type Config,
} from './config'

// Client
export {
  createClient,
  requireAuth,
} from './client'

