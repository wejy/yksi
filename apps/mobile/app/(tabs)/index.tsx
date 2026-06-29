import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { useTabScrollBottomPadding } from '@/lib/layout'

interface TodayTask {
  id: string
  title: string
  status: string
  dueAt: string | null
  startAt: string | null
}

// Based on ui/dashboard_korjattu/code.html
export default function DashboardScreen() {
  const router = useRouter()
  const scrollBottomPadding = useTabScrollBottomPadding()
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [summary, setSummary] = useState({ total: 0, completed: 0, remaining: 0 })
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<{ tasks: TodayTask[]; summary: typeof summary }>('/api/tasks/today'),
      apiFetch<{ total: number }>('/api/tasks?status=open'),
    ])
      .then(([today, pending]) => {
        setTasks(today.tasks)
        setSummary(today.summary)
        setPendingCount(pending.total ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3525cd" />
      </View>
    )
  }

  const picks = tasks.slice(0, 5)
  const percent =
    summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0

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
            <Text className="text-sm font-semibold text-on-primary-container">M</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
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
          <Text className="text-sm text-on-surface-variant">
            Hienoa työtä! Olet lähes tavoitteessasi.
          </Text>
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

        {picks.map((task) => (
          <Pressable
            key={task.id}
            onPress={() => router.push(`/task/${task.id}`)}
            className={`mb-3 flex-row items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ${task.status === 'done' ? 'opacity-75' : ''}`}
          >
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-container/20">
              <Text>{task.status === 'done' ? '✓' : '📄'}</Text>
            </View>
            <View className="flex-1">
              <Text
                className={`font-semibold text-on-surface ${task.status === 'done' ? 'line-through' : ''}`}
              >
                {task.title}
              </Text>
              <Text className="text-sm text-on-surface-variant">
                {task.status === 'done' ? 'Valmis' : 'Tänään'}
              </Text>
            </View>
            <Text className="text-on-surface-variant">›</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push('/(tabs)/tasks')}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4"
        >
          <Text className="text-lg text-on-primary">+</Text>
          <Text className="font-bold text-on-primary">Uusi tehtävä</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}
