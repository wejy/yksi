'use client'

import { useRouter } from 'next/navigation'
import { type ThemePreference } from '@yksi/core'
import { useI18n } from '@yksi/i18n/react'
import { useTheme } from '@/components/theme-provider'
import { screenBottomPaddingClass } from '@yksi/ui'

const THEME_OPTIONS: Array<{
  value: ThemePreference
  icon: string
  labelKey: 'light' | 'dark' | 'system'
  hintKey?: 'systemHint'
}> = [
  { value: 'light', icon: 'light_mode', labelKey: 'light' },
  { value: 'dark', icon: 'dark_mode', labelKey: 'dark' },
  { value: 'system', icon: 'brightness_auto', labelKey: 'system', hintKey: 'systemHint' },
]

// Based on ui/profiili_ja_integraatiot/code.html — Teema
export default function ThemeSettingsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()

  return (
    <div className={`mx-auto min-h-screen max-w-2xl ${screenBottomPaddingClass}`}>
      <header className="fixed top-0 z-50 flex h-16 w-full items-center gap-3 border-b border-outline-variant/50 bg-surface-container-lowest/80 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
          aria-label={t('common.back')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-on-surface">{t('profile.themePage.title')}</h1>
      </header>

      <main className="space-y-4 px-4 pt-24">
        <p className="text-sm text-on-surface-variant">{t('profile.themePage.description')}</p>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          {THEME_OPTIONS.map((option, index) => {
            const selected = theme === option.value

            return (
              <div key={option.value}>
                <button
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="material-symbols-outlined text-primary">{option.icon}</span>
                    <div className="min-w-0">
                      <span className="block font-medium text-on-surface">
                        {t(`profile.themePage.${option.labelKey}`)}
                      </span>
                      {option.hintKey ? (
                        <span className="mt-0.5 block text-xs text-on-surface-variant">
                          {t(`profile.themePage.${option.hintKey}`)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined shrink-0 ${selected ? 'text-primary' : 'text-transparent'}`}
                    style={selected ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    aria-hidden
                  >
                    check_circle
                  </span>
                </button>
                {index < THEME_OPTIONS.length - 1 ? (
                  <div className="mx-4 h-px bg-outline-variant" />
                ) : null}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
