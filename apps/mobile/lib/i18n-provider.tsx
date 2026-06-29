import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { isLocale, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from '@yksi/i18n'
import { I18nProvider } from '@yksi/i18n/react'
import { apiFetch } from '@/lib/api'

export function MobileI18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      try {
        const stored = await SecureStore.getItemAsync(LOCALE_STORAGE_KEY)
        if (stored && isLocale(stored)) {
          setLocale(stored)
        }
        const user = await apiFetch<{ locale?: string }>('/api/user/me')
        if (user.locale && isLocale(user.locale)) {
          setLocale(user.locale)
        }
      } catch {
        // Guest / offline — keep stored or default locale
      } finally {
        setReady(true)
      }
    }
    void bootstrap()
  }, [])

  if (!ready) return null

  return (
    <I18nProvider
      initialLocale={locale}
      persistLocale={async (next: Locale) => {
        setLocale(next)
        await SecureStore.setItemAsync(LOCALE_STORAGE_KEY, next)
      }}
    >
      {children}
    </I18nProvider>
  )
}
