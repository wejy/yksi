import { View, Text, Pressable } from 'react-native'
import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEW_MODES,
  type CalendarViewMode,
} from '@yksi/core'

export function CalendarViewToggle({
  value,
  onChange,
}: {
  value: CalendarViewMode
  onChange: (mode: CalendarViewMode) => void
}) {
  return (
    <View className="flex-row self-start rounded-lg border border-outline-variant bg-surface-container-low p-1">
      {CALENDAR_VIEW_MODES.map((mode) => (
        <Pressable
          key={mode}
          onPress={() => onChange(mode)}
          className={`rounded-md px-3 py-1.5 ${value === mode ? 'bg-primary' : ''}`}
        >
          <Text
            className={`text-sm font-medium ${value === mode ? 'text-on-primary' : 'text-on-surface-variant'}`}
          >
            {CALENDAR_VIEW_LABELS[mode]}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
