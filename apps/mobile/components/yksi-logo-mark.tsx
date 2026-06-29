import { Pressable, Text } from 'react-native'
import { useRouter } from 'expo-router'

export function YksiLogoMark() {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push('/')}
      accessibilityRole="link"
      accessibilityLabel="Yksi etusivu"
      className="h-8 w-8 items-center justify-center rounded-lg bg-primary"
    >
      <Text className="text-sm font-bold lowercase text-on-primary">y</Text>
    </Pressable>
  )
}
