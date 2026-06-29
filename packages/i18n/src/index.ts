import { fi, type Messages } from './locales/fi'
import { en } from './locales/en'

export type { Messages } from './locales/fi'

export const LOCALES = ['fi', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fi'
export const LOCALE_COOKIE = 'yksi_locale'
export const LOCALE_STORAGE_KEY = 'yksi_locale'

const dictionaries: Record<Locale, Messages> = { fi, en }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale]
}

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string

export function createTranslator(locale: Locale): TranslateFn {
  const messages = getMessages(locale)

  return function t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split('.')
    let cur: unknown = messages
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = (cur as Record<string, unknown>)[part]
      } else {
        return key
      }
    }
    if (typeof cur !== 'string') return key
    if (!params) return cur
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
      cur,
    )
  }
}

export function readLocaleCookie(): Locale | null {
  const doc = (globalThis as { document?: { cookie: string } }).document
  if (!doc) return null
  const match = doc.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))
  const value = match?.[1]
  return value && isLocale(value) ? value : null
}

export function setLocaleCookie(locale: Locale) {
  const doc = (globalThis as { document?: { cookie: string } }).document
  if (!doc) return
  doc.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`
}
