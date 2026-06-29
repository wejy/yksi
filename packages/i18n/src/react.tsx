'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createTranslator,
  DEFAULT_LOCALE,
  readLocaleCookie,
  setLocaleCookie,
  type Locale,
  type TranslateFn,
} from './index'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  children,
  initialLocale,
  persistLocale,
}: {
  children: ReactNode
  initialLocale?: Locale
  persistLocale?: (locale: Locale) => void | Promise<void>
}) {
  const [locale, setLocaleState] = useState<Locale>(
    () => initialLocale ?? readLocaleCookie() ?? DEFAULT_LOCALE,
  )

  useEffect(() => {
    if (initialLocale) setLocaleState(initialLocale)
  }, [initialLocale])

  useEffect(() => {
    const doc = (globalThis as { document?: { documentElement: { lang: string } } }).document
    if (doc) {
      doc.documentElement.lang = locale
    }
  }, [locale])

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      setLocaleCookie(next)
      void persistLocale?.(next)
    },
    [persistLocale],
  )

  const t = useMemo(() => createTranslator(locale), [locale])
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
