import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MobileI18nProvider } from '@/lib/i18n-provider'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileI18nProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="task/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="tasks/new" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/personal" options={{ presentation: 'card' }} />
          <Stack.Screen name="login" />
        </Stack>
      </MobileI18nProvider>
    </SafeAreaProvider>
  )
}
