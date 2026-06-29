'use client'

import { useEffect, useState } from 'react'
import { isLocale, DEFAULT_LOCALE, type Locale } from '@yksi/i18n'
import { I18nProvider } from '@yksi/i18n/react'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user?.locale && isLocale(user.locale)) {
          setLocale(user.locale)
        }
      })
      .catch(() => {})
  }, [])

  return <I18nProvider initialLocale={locale}>{children}</I18nProvider>
}
