import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium'])
export const taskSourceEnum = pgEnum('task_source', [
  'linear',
  'notion',
  'google_calendar',
  'native',
])
export const taskStatusEnum = pgEnum('task_status', [
  'open',
  'in_progress',
  'done',
  'cancelled',
])
export const taskPriorityEnum = pgEnum('task_priority', [
  'none',
  'low',
  'medium',
  'high',
  'urgent',
])
export const integrationProviderEnum = pgEnum('integration_provider', [
  'linear',
  'notion',
  'google_calendar',
])
export const connectionStatusEnum = pgEnum('connection_status', [
  'active',
  'disconnected',
  'error',
])
export const syncStatusEnum = pgEnum('sync_status', ['success', 'error', 'partial'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  emailVerified: boolean('email_verified').notNull().default(false),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  timezone: text('timezone').notNull().default('Europe/Helsinki'),
  locale: text('locale').notNull().default('fi'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const yhteispinnat = pgTable('yhteispinnat', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
  sourceMapping: jsonb('source_mapping'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    source: taskSourceEnum('source').notNull(),
    externalId: text('external_id'),
    externalUrl: text('external_url'),
    title: text('title').notNull(),
    description: text('description'),
    contentDocument: jsonb('content_document'),
    status: taskStatusEnum('status').notNull().default('open'),
    priority: taskPriorityEnum('priority').notNull().default('none'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    startAt: timestamp('start_at', { withTimezone: true }),
    endAt: timestamp('end_at', { withTimezone: true }),
    reminderAt: timestamp('reminder_at', { withTimezone: true }),
    yhteispintaId: uuid('yhteispinta_id').references(() => yhteispinnat.id, {
      onDelete: 'set null',
    }),
    labels: text('labels').array().notNull().default([]),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
    rawPayload: jsonb('raw_payload').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('tasks_user_source_external_idx').on(
      table.userId,
      table.source,
      table.externalId,
    ),
    index('tasks_user_status_idx').on(table.userId, table.status),
    index('tasks_user_due_idx').on(table.userId, table.dueAt),
    index('tasks_user_reminder_idx').on(table.userId, table.reminderAt),
    index('tasks_user_source_idx').on(table.userId, table.source),
    index('tasks_yhteispinta_idx').on(table.yhteispintaId),
  ],
)

export const integrationConnections = pgTable(
  'integration_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: integrationProviderEnum('provider').notNull(),
    accessTokenEncrypted: text('access_token_encrypted').notNull(),
    refreshTokenEncrypted: text('refresh_token_encrypted'),
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
    status: connectionStatusEnum('status').notNull().default('active'),
    metadata: jsonb('metadata').notNull().default({}),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('integration_connections_user_provider_idx').on(
      table.userId,
      table.provider,
    ),
  ],
)

export const syncLogs = pgTable('sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => integrationConnections.id, { onDelete: 'cascade' }),
  status: syncStatusEnum('status').notNull(),
  tasksCreated: integer('tasks_created').notNull().default(0),
  tasksUpdated: integer('tasks_updated').notNull().default(0),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  platform: text('platform').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
