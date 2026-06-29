import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { apiFetch } from '@/lib/api'

// Based on ui/teht_v_n_tiedot/code.html
export default function TaskDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    apiFetch<{ title: string; description: string | null; source: string }>(
      `/api/tasks/${id}`,
    )
      .then((data) => {
        setTitle(data.title)
        setDescription(data.description ?? '')
        setSource(data.source)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    await apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description }),
    })
    setSaving(false)
    router.back()
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3525cd" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Pressable onPress={() => router.back()} className="mr-3 p-2">
          <Text className="text-lg">←</Text>
        </Pressable>
        <Text className="text-lg font-bold">Tehtävän tiedot</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <TextInput
          value={title}
          onChangeText={setTitle}
          className="mb-4 text-2xl font-bold text-on-surface"
          multiline
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Kuvaus..."
          className="mb-6 min-h-[100px] rounded-lg border border-outline-variant p-3 text-sm"
          multiline
        />
        <Text className="text-xs text-on-surface-variant">Lähde: {source}</Text>
      </ScrollView>

      <View className="border-t border-outline-variant bg-surface-container-lowest p-4">
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="items-center rounded-full bg-primary py-3"
        >
          <Text className="font-semibold text-on-primary">
            {saving ? 'Tallennetaan...' : 'Tallenna muutokset'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
