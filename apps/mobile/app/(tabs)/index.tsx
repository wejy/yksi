import { useCallback, useRef, useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { useTabScrollBottomPadding } from '@/lib/layout'
import type { TaskStatus, TodaySummary } from '@yksi/core'

interface TodayTask {
  id: string
  title: string
  status: TaskStatus
  dueAt: string | null
  startAt: string | null
}

const EMPTY_SUMMARY: TodaySummary = { total: 0, completed: 0, remaining: 0 }

function formatTaskMeta(task: TodayTask): string {
  if (task.status === 'done') return 'Valmis'
  if (task.startAt) {
    return `Alkaa klo ${new Date(task.startAt).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`
  }
  if (task.dueAt) {
    return `Deadline: ${new Date(task.dueAt).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`
  }
  return 'Tänään'
}

function taskEmoji(task: TodayTask): string {
  if (task.status === 'done') return '✓'
  if (task.startAt) return '👥'
  return '📄'
}

// Based on ui/dashboard_korjattu/code.html
export default function DashboardScreen() {
  const router = useRouter()
  const scrollBottomPadding = useTabScrollBottomPadding()
  const isFirstLoad = useRef(true)
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [summary, setSummary] = useState<TodaySummary>(EMPTY_SUMMARY)
  const [pendingCount, setPendingCount] = useState(0)
  const [userInitial, setUserInitial] = useState('Y')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setError(null)
    try {
      const [today, pending, user] = await Promise.all([
        apiFetch<{ tasks?: TodayTask[]; summary?: TodaySummary }>('/api/tasks/today'),
        apiFetch<{ total?: number }>('/api/tasks?status=open'),
        apiFetch<{ name?: string | null; email?: string }>('/api/user/me'),
      ])
      setTasks(today.tasks ?? [])
      setSummary(today.summary ?? EMPTY_SUMMARY)
      setPendingCount(pending.total ?? 0)
      setUserInitial((user.name ?? user.email ?? 'Y')[0]?.toUpperCase() ?? 'Y')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Tietojen lataus epäonnistui')
    } finally {
      setLoading(false)
      isFirstLoad.current = false
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        setLoading(true)
      }
      void loadDashboard()
    }, [loadDashboard]),
  )

  if (loading && isFirstLoad.current) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3525cd" />
      </View>
    )
  }

  const picks = tasks.slice(0, 5)
  const percent =
    summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0
  const progressMessage =
    percent >= 80
      ? 'Hienoa työtä! Olet lähes tavoitteessasi.'
      : 'Jatka eteenpäin — pienet askeleet vievät perille.'

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Text className="text-sm font-bold text-on-primary">Y</Text>
            </View>
            <Text className="text-xl font-semibold text-on-surface">Yksi</Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-container">
            <Text className="text-sm font-semibold text-on-primary-container">{userInitial}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        {error ? (
          <View className="mb-4 rounded-xl border border-error/30 bg-error-container px-4 py-3">
            <Text className="text-sm text-on-error-container">{error}</Text>
          </View>
        ) : null}

        <View className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Tämän päivän edistyminen
              </Text>
              <Text className="text-xl font-semibold text-on-surface">
                {summary.completed}/{summary.total} tehtävää valmiina
              </Text>
            </View>
            <View className="h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-surface-container-low">
              <Text className="text-xs font-bold text-on-surface">{percent}%</Text>
            </View>
          </View>
          <Text className="text-sm text-on-surface-variant">{progressMessage}</Text>
        </View>

        <View className="mb-6 flex-row gap-4">
          <View className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <Text className="mb-2 text-2xl">📋</Text>
            <Text className="text-xs text-on-surface-variant">Odottavat tehtävät</Text>
            <Text className="text-2xl font-semibold text-on-surface">{pendingCount}</Text>
          </View>
          <View className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <Text className="mb-2 text-2xl">⏱️</Text>
            <Text className="text-xs text-on-surface-variant">Tehtäviä tänään</Text>
            <Text className="text-2xl font-semibold text-on-surface">{summary.total}</Text>
          </View>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-on-surface">Päivän poiminnat</Text>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <Text className="text-sm font-semibold text-primary">Näytä kaikki</Text>
          </Pressable>
        </View>

        {picks.length === 0 ? (
          <Text className="py-8 text-center text-sm text-on-surface-variant">
            Ei tehtäviä tänään. Hyvää työpäivää!
          </Text>
        ) : (
          picks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => router.push(`/task/${task.id}`)}
              className={`mb-3 flex-row items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ${task.status === 'done' ? 'opacity-75' : ''}`}
            >
              <View
                className={`h-10 w-10 items-center justify-center rounded-lg ${task.status === 'done' ? 'bg-surface-container' : 'bg-primary-container/20'}`}
              >
                <Text>{taskEmoji(task)}</Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`font-semibold text-on-surface ${task.status === 'done' ? 'line-through' : ''}`}
                >
                  {task.title}
                </Text>
                <Text className="text-sm text-on-surface-variant">{formatTaskMeta(task)}</Text>
              </View>
              <Text className="text-on-surface-variant">›</Text>
            </Pressable>
          ))
        )}

        <Pressable
          onPress={() => router.push('/tasks/new')}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4"
        >
          <Text className="text-lg text-on-primary">+</Text>
          <Text className="font-bold text-on-primary">Uusi tehtävä</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}
