import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { fromDatetimeLocalValue } from '@yksi/core'
import { useStackScrollBottomPadding } from '@/lib/layout'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DeadlineReminderFields } from '@/components/deadline-reminder-fields'
import { IntressiField, type IntressiOption } from '@/components/intressi-field'

export default function NewTaskScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollBottomPadding = useStackScrollBottomPadding()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [intressit, setIntressit] = useState<IntressiOption[]>([])
  const [intressiId, setIntressiId] = useState<string | null>(null)
  const [deadline, setDeadline] = useState('')
  const [reminder, setReminder] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<{ intressit: IntressiOption[] }>('/api/yhteispinnat')
      .then((data) => setIntressit(data.intressit ?? []))
      .catch(console.error)
  }, [])

  async function handleCreate() {
    if (!title.trim()) {
      setError('Otsikko on pakollinen')
      return
    }

    setSaving(true)
    setError('')
    try {
      const task = await apiFetch<{ id: string }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          yhteispintaId: intressiId,
          dueAt: fromDatetimeLocalValue(deadline),
          reminderAt: fromDatetimeLocalValue(reminder),
        }),
      })
      router.replace(`/task/${task.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tehtävän luonti epäonnistui')
      setSaving(false)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Text className="text-primary">← Takaisin</Text>
        </Pressable>
        <Text className="text-lg font-bold text-on-surface">Uusi tehtävä</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1 text-sm font-medium text-on-surface-variant">Otsikko</Text>
        <TextInput
          className="mb-4 rounded-lg border border-outline-variant px-4 py-3"
          placeholder="Mitä pitää tehdä?"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <IntressiField
          intressit={intressit}
          value={intressiId}
          onChange={setIntressiId}
          onCreated={(intressi) => setIntressit((prev) => [...prev, intressi])}
        />

        <DeadlineReminderFields
          deadline={deadline}
          reminder={reminder}
          onDeadlineChange={setDeadline}
          onReminderChange={setReminder}
        />

        <Text className="mb-1 text-sm font-medium text-on-surface-variant">Kuvaus</Text>
        <TextInput
          className="mb-4 rounded-lg border border-outline-variant px-4 py-3"
          placeholder="Lisätiedot (valinnainen)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {error ? <Text className="mb-4 text-sm text-error">{error}</Text> : null}
      </ScrollView>

      <View
        className="border-t border-outline-variant bg-surface-container-lowest px-4 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          onPress={handleCreate}
          disabled={saving}
          className={`items-center rounded-full bg-primary py-3 ${saving ? 'opacity-60' : ''}`}
        >
          <Text className="font-semibold text-on-primary">
            {saving ? 'Luodaan...' : 'Luo tehtävä'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
