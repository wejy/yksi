import { View, Text, TextInput, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'

const DEMO_EMAIL = 'example@user.com'
const DEMO_PASSWORD = 'password1234'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function fillDemoCredentials() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      await apiFetch('/api/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kirjautuminen epäonnistui')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="mb-2 text-3xl font-bold text-primary">Yksi</Text>
      <Text className="mb-6 text-sm text-on-surface-variant">
        Kaikki tehtävät yhteen näkymään
      </Text>

      <View className="mb-6 w-full rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-3">
        <Text className="text-xs font-medium uppercase text-on-surface-variant">
          Demotili
        </Text>
        <Text className="mt-1 text-sm text-on-surface">
          {DEMO_EMAIL} / {DEMO_PASSWORD}
        </Text>
        <Pressable onPress={fillDemoCredentials} className="mt-2">
          <Text className="text-sm font-semibold text-primary">Täytä demotiedot</Text>
        </Pressable>
      </View>

      <TextInput
        className="mb-3 w-full rounded-lg border border-outline-variant px-4 py-3"
        placeholder="Sähköposti"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        className="mb-4 w-full rounded-lg border border-outline-variant px-4 py-3"
        placeholder="Salasana"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      {error ? <Text className="mb-4 text-sm text-error">{error}</Text> : null}

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        className={`w-full items-center rounded-full bg-primary py-3 ${loading ? 'opacity-60' : ''}`}
      >
        <Text className="font-semibold text-on-primary">
          {loading ? 'Odota...' : 'Kirjaudu sisään'}
        </Text>
      </Pressable>
    </View>
  )
}
