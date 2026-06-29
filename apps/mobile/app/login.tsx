import { View, Text, TextInput, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin() {
    try {
      await apiFetch('/api/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kirjautuminen epäonnistui')
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="mb-2 text-3xl font-bold text-primary">Yksi</Text>
      <Text className="mb-8 text-sm text-on-surface-variant">
        Kaikki tehtävät yhteen näkymään
      </Text>

      <TextInput
        className="mb-3 w-full rounded-lg border border-outline-variant px-4 py-3"
        placeholder="Sähköposti"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="mb-4 w-full rounded-lg border border-outline-variant px-4 py-3"
        placeholder="Salasana"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text className="mb-4 text-sm text-error">{error}</Text> : null}

      <Pressable
        onPress={handleLogin}
        className="w-full items-center rounded-full bg-primary py-3"
      >
        <Text className="font-semibold text-on-primary">Kirjaudu sisään</Text>
      </Pressable>
    </View>
  )
}
