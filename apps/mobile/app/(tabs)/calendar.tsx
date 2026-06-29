import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import {
  DEFAULT_CALENDAR_VIEW_MODE,
  filterTasksForDay,
  formatCalendarPeriodLabel,
  formatTaskTimeRange,
  isSameCalendarDay,
  navigateCalendarPeriod,
  type CalendarViewMode,
  type TaskSource,
  type TaskStatus,
} from '@yksi/core'
import { apiFetch } from '@/lib/api'
import { useTabScrollBottomPadding } from '@/lib/layout'
import { TaskCalendar } from '@/components/task-calendar'
import { TaskWeekCalendar } from '@/components/task-week-calendar'
import { CalendarViewToggle } from '@/components/calendar-view-toggle'
import { TaskDayStrip } from '@/components/calendar-task-indicator'

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
  const [viewMode, setViewMode] = useState<CalendarViewMode>(DEFAULT_CALENDAR_VIEW_MODE)
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

  const periodLabel = formatCalendarPeriodLabel(viewMode, selectedDate, viewDate)
  const subtitle =
    viewMode === 'day'
      ? isSameCalendarDay(selectedDate, new Date())
        ? `${dayTasks.length} tehtävää tänään`
        : `${dayTasks.length} tehtävää`
      : viewMode === 'week'
        ? `${dayTasks.length} tehtävää valitulla päivällä`
        : isSameCalendarDay(selectedDate, new Date())
          ? `${dayTasks.length} tehtävää tänään (valittu päivä)`
          : `${dayTasks.length} tehtävää valittuna päivänä`

  function goToPrevious() {
    if (viewMode === 'day') {
      const next = navigateCalendarPeriod('day', selectedDate, -1)
      setSelectedDate(next)
      setViewDate(next)
      return
    }
    setViewDate((current) => navigateCalendarPeriod(viewMode, current, -1))
  }

  function goToNext() {
    if (viewMode === 'day') {
      const next = navigateCalendarPeriod('day', selectedDate, 1)
      setSelectedDate(next)
      setViewDate(next)
      return
    }
    setViewDate((current) => navigateCalendarPeriod(viewMode, current, 1))
  }

  function handleViewModeChange(mode: CalendarViewMode) {
    setViewMode(mode)
    if (mode === 'month') {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    } else {
      setViewDate(selectedDate)
    }
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    if (viewMode === 'month') {
      if (
        date.getMonth() !== viewDate.getMonth() ||
        date.getFullYear() !== viewDate.getFullYear()
      ) {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
      }
    } else if (viewMode === 'day') {
      setViewDate(date)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-2xl font-bold capitalize text-on-surface">{periodLabel}</Text>
            <Text className="mt-1 text-sm text-on-surface-variant">{subtitle}</Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={goToPrevious}
              className="rounded-lg border border-outline-variant p-2"
            >
              <Text className="text-lg text-on-surface">‹</Text>
            </Pressable>
            <Pressable
              onPress={goToNext}
              className="rounded-lg border border-outline-variant p-2"
            >
              <Text className="text-lg text-on-surface">›</Text>
            </Pressable>
          </View>
        </View>
        <View className="mt-3">
          <CalendarViewToggle value={viewMode} onChange={handleViewModeChange} />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        {viewMode === 'day' ? (
          <TaskDayStrip
            selectedDate={selectedDate}
            tasks={tasks}
            onSelectDate={handleSelectDate}
          />
        ) : null}

        {viewMode === 'month' ? (
          <TaskCalendar
            viewDate={viewDate}
            selectedDate={selectedDate}
            tasks={tasks}
            onDayPress={handleSelectDate}
            onMonthChange={setViewDate}
          />
        ) : null}

        {viewMode === 'week' ? (
          <TaskWeekCalendar
            viewDate={viewDate}
            selectedDate={selectedDate}
            tasks={tasks}
            onSelectDate={handleSelectDate}
            onTaskPress={(task) => router.push(`/task/${task.id}`)}
          />
        ) : null}

        {viewMode === 'day' || viewMode === 'month' ? (
          <View className={viewMode === 'day' ? 'mt-4' : 'mt-6'}>
            {viewMode === 'month' ? (
              <Text className="mb-3 text-lg font-semibold capitalize text-on-surface">
                {selectedDate.toLocaleDateString('fi-FI', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            ) : null}

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
        ) : null}
      </ScrollView>
    </View>
  )
}
