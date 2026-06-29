import { View, Text, Pressable } from 'react-native'
import {
  countTasksOnDay,
  formatTaskCountBadge,
  getWeekDaysContaining,
  isSameCalendarDay,
  toCalendarDateKey,
  type TaskCalendarInput,
} from '@yksi/core'

export function CalendarTaskCountBadge({
  count,
  selected = false,
}: {
  count: number
  selected?: boolean
}) {
  if (count <= 0) return null

  return (
    <View
      className={`min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 ${
        selected ? 'bg-white/25 ring-1 ring-white/40' : 'bg-primary'
      }`}
    >
      <Text className={`text-[10px] font-bold ${selected ? 'text-on-primary' : 'text-on-primary'}`}>
        {formatTaskCountBadge(count)}
      </Text>
    </View>
  )
}

export function CalendarDayTaskIndicator({
  count,
  selected = false,
}: {
  count: number
  selected?: boolean
}) {
  if (count <= 0) {
    return <View className="h-[18px]" />
  }

  return (
    <View className="w-full items-center gap-0.5">
      <View className={`h-1 w-5 rounded-full ${selected ? 'bg-white/50' : 'bg-primary/35'}`} />
      <CalendarTaskCountBadge count={count} selected={selected} />
    </View>
  )
}

export function TaskDayStrip({
  selectedDate,
  tasks,
  onSelectDate,
}: {
  selectedDate: Date
  tasks: TaskCalendarInput[]
  onSelectDate: (date: Date) => void
}) {
  const weekDays = getWeekDaysContaining(selectedDate)
  const today = new Date()

  return (
    <View className="rounded-xl border border-outline-variant bg-surface-container-lowest p-2">
      <View className="flex-row">
        {weekDays.map((day) => {
          const isSelected = isSameCalendarDay(day, selectedDate)
          const isToday = isSameCalendarDay(day, today)
          const taskCount = countTasksOnDay(tasks, day)

          return (
            <Pressable
              key={toCalendarDateKey(day)}
              onPress={() => onSelectDate(day)}
              className={`flex-1 items-center rounded-lg px-1 py-2 ${
                isSelected
                  ? 'bg-primary'
                  : taskCount > 0
                    ? 'bg-primary/5'
                    : ''
              } ${isToday && !isSelected ? 'border border-primary/30' : ''}`}
            >
              <Text
                className={`text-[10px] font-semibold uppercase ${
                  isSelected ? 'text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                {day.toLocaleDateString('fi-FI', { weekday: 'short' }).replace('.', '').slice(0, 2)}
              </Text>
              <Text
                className={`text-sm font-bold ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}
              >
                {day.getDate()}
              </Text>
              <View className="mt-1 h-[18px] items-center justify-center">
                {taskCount > 0 ? (
                  <CalendarTaskCountBadge count={taskCount} selected={isSelected} />
                ) : null}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
