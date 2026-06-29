import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { useRouter, type Href } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { INTEGRATION_CATALOG, YKSI_DEV_URL, formatSyncResult, formatSyncError, getProviderLabel } from '@yksi/core'
import { useTabScrollBottomPadding } from '@/lib/layout'
import { useI18n } from '@yksi/i18n/react'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? YKSI_DEV_URL

const EMOJI: Record<string, string> = {
  linear: '📊',
  notion: '📝',
  google_calendar: '📅',
  slack: '💬',
  outlook: '📧',
  jira: '🐛',
}

interface Connection {
  provider: string
  status: string
}

interface User {
  email: string
  name: string | null
  subscriptionTier: string
}

// Based on ui/profiili_ja_integraatiot/code.html
export default function ProfileScreen() {
  const router = useRouter()
  const { t } = useI18n()
  const scrollBottomPadding = useTabScrollBottomPadding()
  const [user, setUser] = useState<User | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [banner, setBanner] = useState<string | null>(null)
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<User>('/api/user/me').then(setUser).catch(console.error)
    refreshConnections()
  }, [])

  async function refreshConnections() {
    const data = await apiFetch<{ connections: Connection[] }>('/api/integrations')
    setConnections(data.connections)
  }

  function isConnected(provider: string) {
    return connections.some((c) => c.provider === provider && c.status === 'active')
  }

  async function handleSync(providerId: string) {
    setSyncingProvider(providerId)
    setBanner(null)
    try {
      const data = await apiFetch<{ created: number; updated: number }>(
        `/api/integrations/${providerId}/sync`,
        { method: 'POST' },
      )
      setBanner(formatSyncResult(providerId, data))
      await refreshConnections()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Synkka epäonnistui.'
      setBanner(formatSyncError(providerId, message))
    } finally {
      setSyncingProvider(null)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Text className="text-xl font-bold text-primary">{t('profile.title')}</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        {banner ? (
          <View className="mb-4 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
            <Text className="text-sm text-on-surface">{banner}</Text>
          </View>
        ) : null}

        {user && (
          <View className="mb-8 items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary-container">
              <Text className="text-3xl font-bold text-on-primary-container">
                {(user.name ?? user.email)[0]?.toUpperCase()}
              </Text>
            </View>
            <Text className="text-2xl font-semibold text-on-surface">{user.name ?? t('common.user')}</Text>
            <Text className="text-on-surface-variant">{user.email}</Text>
            <Text className="mt-2 text-xs font-medium capitalize text-primary">
              {user.subscriptionTier === 'premium' ? t('profile.tierPremium') : t('profile.tierFree')}
            </Text>
          </View>
        )}

        {user?.subscriptionTier === 'free' && (
          <Pressable
            onPress={() => Linking.openURL(`${API_URL}/profile`)}
            className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <Text className="font-semibold text-on-surface">{t('profile.upgradeTitle')}</Text>
            <Text className="mt-1 text-sm text-on-surface-variant">{t('profile.upgradeCta')}</Text>
          </Pressable>
        )}

        <Text className="mb-3 px-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          {t('profile.accountSettings')}
        </Text>
        <View className="mb-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          {(
            [
              { key: 'personalDetails', href: '/profile/personal' },
              { key: 'notifications' },
              { key: 'theme' },
            ] as const
          ).map((item, i, arr) => (
            <View key={item.key}>
              <Pressable
                className="flex-row items-center justify-between p-4"
                onPress={() => {
                  if ('href' in item) router.push(item.href as Href)
                }}
              >
                <Text className="font-medium text-on-surface">{t(`profile.${item.key}`)}</Text>
                <Text className="text-on-surface-variant">›</Text>
              </Pressable>
              {i < arr.length - 1 && <View className="mx-4 h-px bg-outline-variant" />}
            </View>
          ))}
        </View>

        <Text className="mb-3 px-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          {t('profile.integrations')}
        </Text>
        {INTEGRATION_CATALOG.map((provider) => {
          const connected = isConnected(provider.id)
          const isAvailable = provider.availability === 'available'

          return (
            <View
              key={provider.id}
              className={`mb-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ${!isAvailable ? 'opacity-80' : ''}`}
            >
              <View className="mb-3 flex-row items-start justify-between">
                <View className="rounded-lg border border-outline-variant bg-surface p-2">
                  <Text>{EMOJI[provider.id] ?? '🔗'}</Text>
                </View>
                {!isAvailable ? (
                  <View className="rounded-full bg-surface-container px-3 py-1">
                    <Text className="text-xs font-medium text-on-surface-variant">{t('profile.comingSoon')}</Text>
                  </View>
                ) : connected ? (
                  <View className="rounded-full border border-primary-container bg-surface-container-high px-3 py-1">
                    <Text className="text-xs font-medium text-primary">{t('profile.connected')}</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() =>
                      Linking.openURL(`${API_URL}/api/integrations/${provider.id}/connect`)
                    }
                    className="rounded-full bg-secondary-container px-3 py-1"
                  >
                    <Text className="text-xs font-medium text-on-secondary-container">{t('profile.connect')}</Text>
                  </Pressable>
                )}
              </View>
              <Text className="font-bold text-on-surface">{provider.name}</Text>
              <Text className="text-sm text-on-surface-variant">{provider.description}</Text>
              {connected && isAvailable ? (
                <Pressable
                  onPress={() => handleSync(provider.id)}
                  disabled={syncingProvider === provider.id}
                  className="mt-3 items-center rounded-full border border-primary bg-primary/5 px-3 py-2 disabled:opacity-60"
                >
                  <Text className="text-xs font-semibold text-primary">
                    {syncingProvider === provider.id ? t('profile.syncing') : t('profile.syncNow')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )
        })}

        <Pressable className="mt-6 items-center rounded-xl bg-error-container py-4">
          <Text className="font-semibold text-on-error-container">{t('profile.signOut')}</Text>
        </Pressable>
        <Text className="mt-4 text-center text-sm text-outline">{t('profile.version')}</Text>
      </ScrollView>

      <Modal visible={syncingProvider !== null} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm items-center rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <ActivityIndicator size="large" color="#6750A4" />
            <Text className="mt-4 text-center text-lg font-semibold text-on-surface">
              {syncingProvider
                ? `Synkronoidaan: ${getProviderLabel(syncingProvider)}`
                : 'Synkronoidaan…'}
            </Text>
            <Text className="mt-2 text-center text-sm text-on-surface-variant">
              Tämä voi kestää hetken, jos tehtäviä on paljon.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}
