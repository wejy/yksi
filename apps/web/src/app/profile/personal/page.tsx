'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, bottomNavPaddingClass, screenBottomPaddingClass } from '@yksi/ui'
import { useI18n } from '@yksi/i18n/react'
import { authClient } from '@/lib/auth-client'
import type { Locale } from '@yksi/i18n'

interface UserProfile {
  email: string
  name: string | null
  locale: string
  hasCredentialAccount: boolean
}

// Based on ui/profiili_ja_integraatiot/code.html — Henkilötiedot
export default function PersonalDetailsPage() {
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<Locale>(locale)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load profile')
        return r.json()
      })
      .then((data: UserProfile) => {
        setUser(data)
        setName(data.name ?? '')
        if (data.locale === 'fi' || data.locale === 'en') {
          setLanguage(data.locale)
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setBanner(null)
    setError(null)

    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          locale: language,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? t('profile.personal.saveFailed'))
      }
      const updated: UserProfile = await res.json()
      setUser(updated)
      if (updated.locale === 'fi' || updated.locale === 'en') {
        setLocale(updated.locale)
      }
      setBanner(t('profile.personal.profileSaved'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.personal.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault()
    setBanner(null)
    setError(null)

    if (newPassword.length < 8) {
      setError(t('profile.personal.passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('profile.personal.passwordMismatch'))
      return
    }

    setChangingPassword(true)
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (result.error) {
        throw new Error(result.error.message ?? t('profile.personal.passwordChangeFailed'))
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setBanner(t('profile.personal.passwordChanged'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.personal.passwordChangeFailed'))
    } finally {
      setChangingPassword(false)
    }
  }

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
        <h1 className="text-lg font-bold text-on-surface">{t('profile.personal.title')}</h1>
      </header>

      <main className="space-y-8 px-4 pt-24">
        {banner ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-on-surface">
            {banner}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-error/30 bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
          </div>
        ) : (
          <>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">
                  {t('profile.personal.name')}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">
                  {t('profile.personal.email')}
                </label>
                <Input value={user?.email ?? ''} disabled readOnly />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">
                  {t('profile.personal.language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Locale)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface"
                >
                  <option value="fi">{t('common.languageFi')}</option>
                  <option value="en">{t('common.languageEn')}</option>
                </select>
              </div>

              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            </form>

            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                {t('profile.personal.passwordSection')}
              </h2>

              {user?.hasCredentialAccount ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-on-surface">
                      {t('profile.personal.currentPassword')}
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-on-surface">
                      {t('profile.personal.newPassword')}
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-on-surface">
                      {t('profile.personal.confirmPassword')}
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" variant="outline" disabled={changingPassword}>
                    {changingPassword ? t('common.loading') : t('profile.personal.changePassword')}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  {t('profile.personal.passwordOAuthHint')}
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
