import { View, Text, Pressable } from 'react-native'
import {
  filterTasksForDay,
  formatTaskTimeRange,
  getWeekDaysContaining,
  isSameCalendarDay,
  toCalendarDateKey,
  type TaskCalendarInput,
} from '@yksi/core'
import { CalendarTaskCountBadge } from '@/components/calendar-task-indicator'

export interface CalendarAgendaTask extends TaskCalendarInput {
  id: string
  title: string
  description?: string | null
}

const ACCENT_BORDERS = ['border-l-primary', 'border-l-tertiary', 'border-l-secondary'] as const

interface TaskWeekCalendarProps<T extends CalendarAgendaTask> {
  viewDate: Date
  selectedDate: Date
  tasks: T[]
  onSelectDate: (date: Date) => void
  onTaskPress: (task: T) => void
}

export function TaskWeekCalendar<T extends CalendarAgendaTask>({
  viewDate,
  selectedDate,
  tasks,
  onSelectDate,
  onTaskPress,
}: TaskWeekCalendarProps<T>) {
  const weekDays = getWeekDaysContaining(viewDate)
  const today = new Date()

  return (
    <View className="gap-3">
      {weekDays.map((day) => {
        const dayTasks = filterTasksForDay(tasks, day)
        const isSelected = isSameCalendarDay(day, selectedDate)
        const isToday = isSameCalendarDay(day, today)

        return (
          <View
            key={toCalendarDateKey(day)}
            className={`overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ${isSelected ? 'border-primary/40' : ''}`}
          >
            <Pressable
              onPress={() => onSelectDate(day)}
              className={`flex-row items-center justify-between border-b border-outline-variant px-4 py-3 ${isSelected ? 'bg-primary/5' : 'bg-surface-container-low/60'}`}
            >
              <View>
                <Text
                  className={`text-sm font-semibold capitalize text-on-surface ${isToday ? 'text-primary' : ''}`}
                >
                  {day.toLocaleDateString('fi-FI', { weekday: 'long' })}
                </Text>
                <Text className="text-xs text-on-surface-variant">
                  {day.toLocaleDateString('fi-FI', { day: 'numeric', month: 'long' })}
                </Text>
              </View>
              <CalendarTaskCountBadge count={dayTasks.length} selected={isSelected} />
            </Pressable>

            {dayTasks.length === 0 ? (
              <Text className="px-4 py-3 text-sm text-on-surface-variant">Ei tehtäviä</Text>
            ) : (
              dayTasks.map((task, index) => {
                const timeRange = formatTaskTimeRange(task.startAt, task.endAt, task.dueAt)
                const accent = ACCENT_BORDERS[index % ACCENT_BORDERS.length]

                return (
                  <Pressable
                    key={task.id}
                    onPress={() => onTaskPress(task)}
                    className={`border-b border-outline-variant px-4 py-3 ${accent} border-l-4`}
                  >
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="flex-1 font-medium text-on-surface">{task.title}</Text>
                      {timeRange ? (
                        <Text className="shrink-0 text-xs text-on-surface-variant">
                          {timeRange}
                        </Text>
                      ) : null}
                    </View>
                    {task.description ? (
                      <Text className="mt-0.5 text-sm text-on-surface-variant" numberOfLines={2}>
                        {task.description}
                      </Text>
                    ) : null}
                  </Pressable>
                )
              })
            )}
          </View>
        )
      })}
    </View>
  )
}
