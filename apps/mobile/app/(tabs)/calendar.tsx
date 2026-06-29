import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import {
  filterTasksForDay,
  formatTaskTimeRange,
  isSameCalendarDay,
  type TaskSource,
  type TaskStatus,
} from '@yksi/core'
import { apiFetch } from '@/lib/api'
import { useTabScrollBottomPadding } from '@/lib/layout'
import { TaskCalendar } from '@/components/task-calendar'

interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  source: TaskSource
  startAt: string | null
  endAt: string | null
  dueAt: string | null
  reminderAt: string | null
}

const ACCENT_BORDERS = ['border-l-primary', 'border-l-tertiary', 'border-l-secondary'] as const

// Based on ui/kalenteri/code.html
export default function CalendarScreen() {
  const router = useRouter()
  const scrollBottomPadding = useTabScrollBottomPadding()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewDate, setViewDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ tasks: Task[] }>('/api/tasks')
      .then((data) => setTasks(data.tasks ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const dayTasks = useMemo(
    () => filterTasksForDay(tasks, selectedDate),
    [tasks, selectedDate],
  )

  const todayTaskCount = useMemo(
    () => filterTasksForDay(tasks, new Date()).length,
    [tasks],
  )

  const monthLabel = viewDate.toLocaleDateString('fi-FI', {
    month: 'long',
    year: 'numeric',
  })

  function goToPrevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  function handleDayPress(date: Date) {
    setSelectedDate(date)
    if (
      date.getMonth() !== viewDate.getMonth() ||
      date.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold capitalize text-on-surface">{monthLabel}</Text>
            <Text className="mt-1 text-sm text-on-surface-variant">
              {isSameCalendarDay(selectedDate, new Date())
                ? `${todayTaskCount} tehtävää tänään`
                : `${dayTasks.length} tehtävää valittuna päivänä`}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={goToPrevMonth}
              className="rounded-lg border border-outline-variant p-2"
            >
              <Text className="text-lg text-on-surface">‹</Text>
            </Pressable>
            <Pressable
              onPress={goToNextMonth}
              className="rounded-lg border border-outline-variant p-2"
            >
              <Text className="text-lg text-on-surface">›</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        <TaskCalendar
          viewDate={viewDate}
          selectedDate={selectedDate}
          tasks={tasks}
          onDayPress={handleDayPress}
          onMonthChange={setViewDate}
        />

        <View className="mt-6">
          <Text className="mb-3 text-lg font-semibold capitalize text-on-surface">
            {selectedDate.toLocaleDateString('fi-FI', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>

          {loading ? (
            <ActivityIndicator color="#3525cd" />
          ) : dayTasks.length === 0 ? (
            <Text className="py-8 text-center text-sm text-on-surface-variant">
              Ei tehtäviä tälle päivälle
            </Text>
          ) : (
            dayTasks.map((task, index) => {
              const timeRange = formatTaskTimeRange(task.startAt, task.endAt, task.dueAt)
              const accent = ACCENT_BORDERS[index % ACCENT_BORDERS.length]

              return (
                <Pressable
                  key={task.id}
                  onPress={() => router.push(`/task/${task.id}`)}
                  className={`mb-3 flex-row overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ${accent} border-l-4`}
                >
                  <View className="flex-1 p-4">
                    <View className="mb-1 flex-row items-start justify-between gap-2">
                      <Text className="flex-1 font-semibold text-on-surface">{task.title}</Text>
                      {timeRange ? (
                        <Text className="shrink-0 text-xs text-on-surface-variant">
                          {timeRange}
                        </Text>
                      ) : null}
                    </View>
                    {task.description ? (
                      <Text className="text-sm text-on-surface-variant" numberOfLines={2}>
                        {task.description}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}
