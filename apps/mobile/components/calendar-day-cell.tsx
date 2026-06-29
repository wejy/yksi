import { Pressable, Text, View } from 'react-native'
import type { DateData } from 'react-native-calendars'
import type { DayState } from 'react-native-calendars/src/types'
import { formatTaskCountBadge } from '@yksi/core'

interface CalendarDayCellProps {
  date?: DateData
  state?: DayState
  marking?: { selected?: boolean }
  onPress?: (date?: DateData) => void
  taskCount: number
}

export function CalendarDayCell({
  date,
  state,
  marking,
  onPress,
  taskCount,
}: CalendarDayCellProps) {
  const selected = state === 'selected' || marking?.selected
  const isToday = state === 'today'
  const isDisabled = state === 'disabled' || state === 'inactive'
  const dayNumber = date?.day

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      className={`h-16 w-9 items-center justify-between rounded-lg py-1.5 ${
        selected
          ? 'bg-primary'
          : taskCount > 0
            ? 'bg-primary/5'
            : ''
      } ${isToday && !selected ? 'border border-primary/30' : ''}`}
    >
      <Text
        className={`text-sm font-medium ${
          selected
            ? 'font-bold text-on-primary'
            : isDisabled
              ? 'text-on-surface-variant/40'
              : 'text-on-surface'
        }`}
      >
        {dayNumber}
      </Text>
      {taskCount > 0 ? (
        <View className="items-center gap-0.5">
          <View className={`h-1 w-5 rounded-full ${selected ? 'bg-white/50' : 'bg-primary/35'}`} />
          <View
            className={`min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 ${
              selected ? 'bg-white/25' : 'bg-primary'
            }`}
          >
            <Text className="text-[10px] font-bold text-on-primary">
              {formatTaskCountBadge(taskCount)}
            </Text>
          </View>
        </View>
      ) : (
        <View className="h-[18px]" />
      )}
    </Pressable>
  )
}
