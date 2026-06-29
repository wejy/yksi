import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl)
  return drizzle(sql, { schema })
}

export type Database = ReturnType<typeof createDb>

let _db: Database | null = null

export function getDb(): Database {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      // Allow Next.js build to complete without a real database connection
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        _db = createDb('postgresql://build:build@localhost:5432/yksi')
      } else {
        throw new Error('DATABASE_URL is not set')
      }
    } else {
      _db = createDb(url)
    }
  }
  return _db
}

export * from './schema'
