import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'

interface Task {
  id: string
  title: string
  description: string | null
  startAt: string | null
  endAt: string | null
  dueAt: string | null
}

// Based on ui/kalenteri/code.html
export default function CalendarScreen() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ tasks: Task[] }>('/api/tasks')
      .then((data) => setTasks(data.tasks))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const dayTasks = tasks.filter((t) => {
    const date = t.startAt ?? t.dueAt
    if (!date) return false
    const d = new Date(date)
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    )
  })

  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + 1 + i)
    return d
  })

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Text className="text-2xl font-bold text-on-surface">Kalenteri</Text>
        <Text className="mt-1 text-sm text-on-surface-variant">
          {selectedDate.toLocaleDateString('fi-FI', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <ScrollView horizontal className="border-b border-outline-variant px-2 py-3">
        {days.map((day) => {
          const isSelected =
            day.getDate() === selectedDate.getDate() &&
            day.getMonth() === selectedDate.getMonth()
          const count = tasks.filter((t) => {
            const d = new Date(t.startAt ?? t.dueAt ?? '')
            return d.getDate() === day.getDate() && d.getMonth() === day.getMonth()
          }).length

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => setSelectedDate(day)}
              className={`mx-1 items-center rounded-lg px-3 py-2 ${isSelected ? 'bg-primary' : ''}`}
            >
              <Text className={`text-xs ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                {day.toLocaleDateString('fi-FI', { weekday: 'short' })}
              </Text>
              <Text className={`text-lg font-bold ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                {day.getDate()}
              </Text>
              {count > 0 && (
                <View className={`mt-1 h-1 w-1 rounded-full ${isSelected ? 'bg-on-primary' : 'bg-primary'}`} />
              )}
            </Pressable>
          )
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator className="mt-8" color="#3525cd" />
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          <Text className="mb-3 font-semibold text-on-surface">
            {selectedDate.toLocaleDateString('fi-FI', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          {dayTasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => router.push(`/task/${task.id}`)}
              className="mb-3 rounded-xl border-l-4 border-l-primary border border-outline-variant bg-surface-container-lowest p-4"
            >
              <Text className="font-semibold text-on-surface">{task.title}</Text>
              {task.description && (
                <Text className="mt-1 text-sm text-on-surface-variant">{task.description}</Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
