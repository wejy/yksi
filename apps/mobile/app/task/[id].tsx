import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { apiFetch } from '@/lib/api'
import {
  INTRESSI_LABEL,
  getTaskSourceMeta,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type LinearTaskSourceDetail,
  type TaskSource,
} from '@yksi/core'
import { useStackScrollBottomPadding } from '@/lib/layout'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DeadlineReminderFields } from '@/components/deadline-reminder-fields'
import { IntressiField, type IntressiOption } from '@/components/intressi-field'

interface TaskDetail {
  title: string
  description: string | null
  source: TaskSource
  status: string
  dueAt: string | null
  reminderAt: string | null
  labels: string[]
  sourceDetail: LinearTaskSourceDetail | null
  yhteispinta: { id: string; name: string } | null
}

// Based on ui/teht_v_n_tiedot/code.html
export default function TaskDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollBottomPadding = useStackScrollBottomPadding()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState<TaskSource>('native')
  const [status, setStatus] = useState('open')
  const [labels, setLabels] = useState<string[]>([])
  const [sourceDetail, setSourceDetail] = useState<LinearTaskSourceDetail | null>(null)
  const [intressit, setIntressit] = useState<IntressiOption[]>([])
  const [intressiId, setIntressiId] = useState<string | null>(null)
  const [yhteispintaName, setYhteispintaName] = useState<string | null>(null)
  const [deadline, setDeadline] = useState('')
  const [reminder, setReminder] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isNative = source === 'native'
  const sourceMeta = getTaskSourceMeta(source)

  useEffect(() => {
    apiFetch<{ intressit: IntressiOption[] }>('/api/yhteispinnat')
      .then((data) => setIntressit(data.intressit ?? []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!id) return
    apiFetch<TaskDetail>(`/api/tasks/${id}`)
      .then((data) => {
        setTitle(data.title)
        setDescription(data.description ?? '')
        setSource(data.source)
        setStatus(data.status)
        setLabels(data.labels ?? [])
        setSourceDetail(data.sourceDetail)
        setIntressiId(data.yhteispinta?.id ?? null)
        setYhteispintaName(data.yhteispinta?.name ?? null)
        setDeadline(toDatetimeLocalValue(data.dueAt))
        setReminder(toDatetimeLocalValue(data.reminderAt))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function toggleDone() {
    const newStatus = status === 'done' ? 'open' : 'done'
    await apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    })
    setStatus(newStatus)
  }

  async function handleSave() {
    setSaving(true)
    await apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title,
        description,
        yhteispintaId: intressiId,
        dueAt: fromDatetimeLocalValue(deadline),
        reminderAt: fromDatetimeLocalValue(reminder),
      }),
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

  const displayIntressi = yhteispintaName ?? sourceDetail?.projectName

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Pressable onPress={() => router.back()} className="mr-3 p-2">
          <Text className="text-lg">←</Text>
        </Pressable>
        <Text className="text-lg font-bold">Tehtävän tiedot</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-3 flex-row flex-wrap gap-2">
          <View className="rounded-full bg-surface-container px-3 py-1">
            <Text className="text-xs font-semibold uppercase text-on-surface-variant">
              {sourceMeta.label}
            </Text>
          </View>
          {sourceDetail?.stateName ? (
            <View className="rounded-full bg-surface-container px-3 py-1">
              <Text className="text-xs text-on-surface-variant">{sourceDetail.stateName}</Text>
            </View>
          ) : null}
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          editable={isNative}
          className="mb-4 text-2xl font-bold text-on-surface"
          multiline
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Kuvaus..."
          editable={isNative}
          className="mb-4 min-h-[100px] rounded-lg border border-outline-variant p-3 text-sm"
          multiline
        />

        {labels.length > 0 ? (
          <View className="mb-4">
            <Text className="mb-2 text-xs font-medium uppercase text-on-surface-variant">Labelit</Text>
            <View className="flex-row flex-wrap gap-2">
              {labels.map((label) => (
                <View key={label} className="rounded-full bg-primary/10 px-3 py-1">
                  <Text className="text-xs font-medium text-primary">{label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {isNative ? (
          <IntressiField
            intressit={intressit}
            value={intressiId}
            onChange={setIntressiId}
            onCreated={(intressi) => setIntressit((prev) => [...prev, intressi])}
          />
        ) : (
          <View className="mb-4">
            <Text className="mb-1 text-xs font-medium uppercase text-on-surface-variant">
              {INTRESSI_LABEL}
            </Text>
            <Text className="text-sm font-semibold text-on-surface">
              {displayIntressi ?? 'Ei valittu'}
            </Text>
          </View>
        )}

        {isNative ? (
          <DeadlineReminderFields
            deadline={deadline}
            reminder={reminder}
            onDeadlineChange={setDeadline}
            onReminderChange={setReminder}
          />
        ) : (
          <View className="mb-4">
            <Text className="text-sm text-on-surface-variant">
              Deadline:{' '}
              {deadline
                ? new Date(fromDatetimeLocalValue(deadline) ?? '').toLocaleString('fi-FI')
                : 'Ei asetettu'}
            </Text>
            <Text className="mt-1 text-sm text-on-surface-variant">
              Hälytysaika:{' '}
              {reminder
                ? new Date(fromDatetimeLocalValue(reminder) ?? '').toLocaleString('fi-FI')
                : 'Ei asetettu'}
            </Text>
          </View>
        )}

        {sourceDetail?.teamName ? (
          <Text className="mb-4 text-sm text-on-surface-variant">
            Linear-tiimi: {sourceDetail.teamName}
          </Text>
        ) : null}

        <Pressable
          onPress={toggleDone}
          className={`mt-2 items-center rounded-full py-3 ${status === 'done' ? 'border border-outline-variant' : 'bg-primary'}`}
        >
          <Text className={`font-semibold ${status === 'done' ? 'text-on-surface' : 'text-on-primary'}`}>
            {status === 'done' ? 'Merkitse avoimeksi' : 'Merkitse valmiiksi'}
          </Text>
        </Pressable>
      </ScrollView>

      {isNative ? (
        <View
          className="border-t border-outline-variant bg-surface-container-lowest px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
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
      ) : null}
    </View>
  )
}
