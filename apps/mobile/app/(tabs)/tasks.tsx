import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueAt: string | null
  yhteispinta: { name: string } | null
}

// Based on ui/teht_v_lista/code.html
export default function TasksScreen() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    apiFetch<{ tasks: Task[] }>(`/api/tasks${params}`)
      .then((data) => setTasks(data.tasks))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search])

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Text className="text-2xl font-bold text-on-surface">Tehtävät</Text>
        <TextInput
          className="mt-3 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-sm"
          placeholder="Etsi tehtäviä..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator className="mt-8" color="#3525cd" />
      ) : (
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 80 }}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => router.push(`/task/${task.id}`)}
              className="mb-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
            >
              <View className="flex-row items-start justify-between">
                <Text
                  className={`flex-1 font-semibold text-on-surface ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
                >
                  {task.title}
                </Text>
                {task.priority !== 'none' && (
                  <View className="ml-2 rounded-full bg-error/10 px-2 py-0.5">
                    <Text className="text-xs font-medium text-error">
                      {task.priority === 'high' || task.priority === 'urgent' ? 'Korkea' : 'Normaali'}
                    </Text>
                  </View>
                )}
              </View>
              {task.description && (
                <Text className="mt-1 text-sm text-on-surface-variant" numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              <View className="mt-2 flex-row gap-3">
                {task.dueAt && (
                  <Text className="text-xs text-on-surface-variant">
                    {new Date(task.dueAt).toLocaleDateString('fi-FI')}
                  </Text>
                )}
                {task.yhteispinta && (
                  <Text className="text-xs text-on-surface-variant">
                    {task.yhteispinta.name}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={() => router.push('/tasks/new')}
        className="absolute bottom-20 right-4 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Text className="text-2xl text-on-primary">+</Text>
      </Pressable>
    </View>
  )
}
