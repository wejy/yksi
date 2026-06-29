'use client'

import { useCallback, useEffect, useState } from 'react'
import { isLocale, DEFAULT_LOCALE, type Locale } from '@yksi/i18n'
import { I18nProvider } from '@yksi/i18n/react'
import { isThemePreference, type ThemePreference } from '@yksi/core'
import { ThemeProvider } from '@/components/theme-provider'
import { getInitialThemePreference } from '@/lib/theme'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [theme, setTheme] = useState<ThemePreference>(() => getInitialThemePreference())

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user?.locale && isLocale(user.locale)) {
          setLocale(user.locale)
        }
        if (user?.theme && isThemePreference(user.theme)) {
          setTheme(user.theme)
        }
      })
      .catch(() => {})
  }, [])

  const persistTheme = useCallback(async (preference: ThemePreference) => {
    try {
      await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: preference }),
      })
    } catch {
      // Guest or offline — local preference still applies
    }
  }, [])

  return (
    <ThemeProvider initialTheme={theme} persistTheme={persistTheme}>
      <I18nProvider initialLocale={locale}>{children}</I18nProvider>
    </ThemeProvider>
  )
}
