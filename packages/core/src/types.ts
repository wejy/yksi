export type TaskSource = 'linear' | 'notion' | 'google_calendar' | 'native'
export type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type SubscriptionTier = 'free' | 'premium'
export type IntegrationProvider = 'linear' | 'notion' | 'google_calendar'
export type ConnectionStatus = 'active' | 'disconnected' | 'error'
export type SyncStatus = 'success' | 'error' | 'partial'

export interface UnifiedTask {
  id: string
  userId: string
  source: TaskSource
  externalId: string | null
  externalUrl: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueAt: Date | null
  startAt: Date | null
  endAt: Date | null
  reminderAt: Date | null
  yhteispintaId: string | null
  labels: string[]
  completedAt: Date | null
  syncedAt: Date
  rawPayload: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Yhteispinta {
  id: string
  userId: string
  name: string
  color: string | null
  icon: string | null
  sourceMapping: Record<string, unknown> | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationConnection {
  id: string
  userId: string
  provider: IntegrationProvider
  status: ConnectionStatus
  metadata: Record<string, unknown>
  lastSyncedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface TaskFilters {
  status?: TaskStatus
  source?: TaskSource
  priority?: TaskPriority
  yhteispintaId?: string
  dueBefore?: Date
  dueAfter?: Date
  search?: string
  limit?: number
  offset?: number
}

export interface TodaySummary {
  total: number
  completed: number
  remaining: number
}
