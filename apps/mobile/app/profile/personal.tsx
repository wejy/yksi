import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useI18n } from '@yksi/i18n/react'
import type { Locale } from '@yksi/i18n'
import { apiFetch } from '@/lib/api'

interface UserProfile {
  email: string
  name: string | null
  locale: string
  hasCredentialAccount: boolean
}

// Based on ui/profiili_ja_integraatiot/code.html — Henkilötiedot
export default function PersonalDetailsScreen() {
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
    apiFetch<UserProfile>('/api/user/me')
      .then((data) => {
        setUser(data)
        setName(data.name ?? '')
        if (data.locale === 'fi' || data.locale === 'en') {
          setLanguage(data.locale)
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  async function handleSaveProfile() {
    setSaving(true)
    setBanner(null)
    setError(null)

    try {
      const updated = await apiFetch<UserProfile>('/api/user/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          locale: language,
        }),
      })
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

  async function handleChangePassword() {
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
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        }),
      })
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
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          accessibilityLabel={t('common.back')}
        >
          <Text className="text-2xl text-on-surface">←</Text>
        </Pressable>
        <Text className="text-xl font-bold text-on-surface">{t('profile.personal.title')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 32 }}>
        {banner ? (
          <View className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <Text className="text-sm text-on-surface">{banner}</Text>
          </View>
        ) : null}
        {error ? (
          <View className="mb-4 rounded-xl border border-error/30 bg-error-container px-4 py-3">
            <Text className="text-sm text-on-error-container">{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator className="mt-16" color="#6750A4" />
        ) : (
          <>
            <Text className="mb-1 text-sm font-medium text-on-surface">{t('profile.personal.name')}</Text>
            <TextInput
              className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />

            <Text className="mb-1 text-sm font-medium text-on-surface">{t('profile.personal.email')}</Text>
            <TextInput
              className="mb-4 rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-on-surface-variant"
              value={user?.email ?? ''}
              editable={false}
            />

            <Text className="mb-2 text-sm font-medium text-on-surface">{t('profile.personal.language')}</Text>
            <View className="mb-6 flex-row gap-2">
              {(['fi', 'en'] as const).map((code) => (
                <Pressable
                  key={code}
                  onPress={() => setLanguage(code)}
                  className={`rounded-full px-4 py-2 ${
                    language === code ? 'bg-primary' : 'bg-surface-container'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      language === code ? 'text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {code === 'fi' ? t('common.languageFi') : t('common.languageEn')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleSaveProfile}
              disabled={saving || !name.trim()}
              className="mb-8 items-center rounded-full bg-primary py-3 disabled:opacity-60"
            >
              <Text className="font-semibold text-on-primary">
                {saving ? t('common.loading') : t('common.save')}
              </Text>
            </Pressable>

            <Text className="mb-4 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              {t('profile.personal.passwordSection')}
            </Text>

            {user?.hasCredentialAccount ? (
              <>
                <Text className="mb-1 text-sm font-medium text-on-surface">
                  {t('profile.personal.currentPassword')}
                </Text>
                <TextInput
                  className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  autoComplete="current-password"
                />
                <Text className="mb-1 text-sm font-medium text-on-surface">
                  {t('profile.personal.newPassword')}
                </Text>
                <TextInput
                  className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
                <Text className="mb-1 text-sm font-medium text-on-surface">
                  {t('profile.personal.confirmPassword')}
                </Text>
                <TextInput
                  className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
                <Pressable
                  onPress={handleChangePassword}
                  disabled={changingPassword || !currentPassword || !newPassword}
                  className="items-center rounded-full border border-outline-variant py-3 disabled:opacity-60"
                >
                  <Text className="font-semibold text-on-surface">
                    {changingPassword ? t('common.loading') : t('profile.personal.changePassword')}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Text className="text-sm text-on-surface-variant">
                {t('profile.personal.passwordOAuthHint')}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}
