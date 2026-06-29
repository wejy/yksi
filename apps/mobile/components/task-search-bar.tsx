import { View, Text, TextInput } from 'react-native'

export function TaskSearchBar({
  value,
  onChangeText,
  placeholder = 'Etsi tehtäviä...',
}: {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
}) {
  return (
    <View className="h-12 flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4">
      <View className="h-6 w-6 items-center justify-center">
        <Text className="text-[20px] leading-none text-on-surface-variant">⌕</Text>
      </View>
      <TextInput
        className="min-h-0 flex-1 p-0 text-base leading-5 text-on-surface"
        placeholder={placeholder}
        placeholderTextColor="#777587"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  )
}
