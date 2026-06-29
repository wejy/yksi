import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, Linking } from 'react-native'
import { apiFetch } from '@/lib/api'
import { INTEGRATION_CATALOG, YKSI_DEV_URL } from '@yksi/core'

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
  const [user, setUser] = useState<User | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    apiFetch<User>('/api/user/me').then(setUser).catch(console.error)
    apiFetch<{ connections: Connection[] }>('/api/integrations')
      .then((data) => setConnections(data.connections))
      .catch(console.error)
  }, [])

  function isConnected(provider: string) {
    return connections.some((c) => c.provider === provider && c.status === 'active')
  }

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Text className="text-xl font-bold text-primary">Profiili</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {user && (
          <View className="mb-8 items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary-container">
              <Text className="text-3xl font-bold text-on-primary-container">
                {(user.name ?? user.email)[0]?.toUpperCase()}
              </Text>
            </View>
            <Text className="text-2xl font-semibold text-on-surface">{user.name ?? 'Käyttäjä'}</Text>
            <Text className="text-on-surface-variant">{user.email}</Text>
            <Text className="mt-2 text-xs font-medium capitalize text-primary">
              {user.subscriptionTier === 'premium' ? 'Premium' : 'Ilmainen'}
            </Text>
          </View>
        )}

        {user?.subscriptionTier === 'free' && (
          <Pressable
            onPress={() => Linking.openURL(`${API_URL}/profile`)}
            className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <Text className="font-semibold text-on-surface">Avaa rajattomat integraatiot</Text>
            <Text className="mt-1 text-sm text-on-surface-variant">
              Päivitä Premiumiin — 9 €/kk
            </Text>
          </Pressable>
        )}

        <Text className="mb-3 px-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Tilin asetukset
        </Text>
        <View className="mb-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          {['Henkilötiedot', 'Ilmoitukset', 'Teema'].map((label, i) => (
            <View key={label}>
              <Pressable className="flex-row items-center justify-between p-4">
                <Text className="font-medium text-on-surface">{label}</Text>
                <Text className="text-on-surface-variant">›</Text>
              </Pressable>
              {i < 2 && <View className="mx-4 h-px bg-outline-variant" />}
            </View>
          ))}
        </View>

        <Text className="mb-3 px-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Integraatiot
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
                    <Text className="text-xs font-medium text-on-surface-variant">Tulossa</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      if (connected) {
                        apiFetch(`/api/integrations/${provider.id}/sync`, { method: 'POST' })
                      } else {
                        Linking.openURL(`${API_URL}/api/integrations/${provider.id}/connect`)
                      }
                    }}
                    className={`rounded-full px-3 py-1 ${connected ? 'border border-primary-container bg-surface-container-high' : 'bg-secondary-container'}`}
                  >
                    <Text
                      className={`text-xs font-medium ${connected ? 'text-primary' : 'text-on-secondary-container'}`}
                    >
                      {connected ? 'Yhdistetty' : 'Yhdistä'}
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text className="font-bold text-on-surface">{provider.name}</Text>
              <Text className="text-sm text-on-surface-variant">{provider.description}</Text>
            </View>
          )
        })}

        <Pressable className="mt-6 items-center rounded-xl bg-error-container py-4">
          <Text className="font-semibold text-on-error-container">Kirjaudu ulos</Text>
        </Pressable>
        <Text className="mt-4 text-center text-sm text-outline">Versio 1.0.0 (MVP)</Text>
      </ScrollView>
    </View>
  )
}
