import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import {
  groupActivityEventsByDay,
  formatActivityTime,
  type ActivityEvent,
} from '@yksi/core'
import { apiFetch } from '@/lib/api'
import { useTabScrollBottomPadding } from '@/lib/layout'
import { useI18n } from '@yksi/i18n/react'

const ACTIVITY_COLORS: Record<ActivityEvent['type'], string> = {
  task_created: 'bg-primary-container',
  task_updated: 'bg-secondary-container',
  task_deleted: 'bg-error-container',
  integration_sync: 'bg-tertiary-container',
  integration_connected: 'bg-tertiary-container',
  profile_updated: 'bg-surface-container-high',
}

// Virta — activity stream
export default function StreamScreen() {
  const router = useRouter()
  const { t, locale } = useI18n()
  const scrollBottomPadding = useTabScrollBottomPadding()
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const localeTag = locale === 'en' ? 'en-GB' : 'fi-FI'
  const groups = groupActivityEventsByDay(events, 'Europe/Helsinki', localeTag)

  useEffect(() => {
    apiFetch<{ events: ActivityEvent[] }>('/api/stream?limit=100')
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  function handleEventPress(event: ActivityEvent) {
    if (event.entityType === 'task' && event.entityId) {
      router.push(`/task/${event.entityId}`)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Text className="text-2xl font-bold text-on-surface">{t('stream.title')}</Text>
        <Text className="mt-1 text-sm text-on-surface-variant">{t('stream.subtitle')}</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        {loading ? (
          <ActivityIndicator color="#3525cd" className="py-12" />
        ) : error ? (
          <Text className="py-12 text-center text-sm text-error">{error}</Text>
        ) : groups.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-4xl">🕘</Text>
            <Text className="mt-3 text-sm text-on-surface-variant">{t('stream.empty')}</Text>
            <Text className="mt-1 text-center text-xs text-outline">{t('stream.emptyHint')}</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.dateKey} className="mb-8">
              <Text
                className={`mb-3 text-sm font-semibold capitalize ${group.isToday ? 'text-primary' : 'text-on-surface-variant'}`}
              >
                {group.label}
              </Text>
              <View className="gap-3">
                {group.events.map((event) => {
                  const clickable = event.entityType === 'task' && event.entityId
                  return (
                    <Pressable
                      key={event.id}
                      onPress={clickable ? () => handleEventPress(event) : undefined}
                      className="flex-row gap-3"
                    >
                      <View
                        className={`mt-1 h-6 w-6 items-center justify-center rounded-full ${ACTIVITY_COLORS[event.type]}`}
                      >
                        <Text className="text-xs">•</Text>
                      </View>
                      <View className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3">
                        <View className="flex-row items-start justify-between gap-3">
                          <Text className="flex-1 text-sm text-on-surface">{event.summary}</Text>
                          <Text className="shrink-0 text-xs text-on-surface-variant">
                            {formatActivityTime(event.createdAt, localeTag)}
                          </Text>
                        </View>
                        {event.type === 'integration_sync' &&
                        event.metadata.status === 'error' &&
                        typeof event.metadata.errorMessage === 'string' ? (
                          <Text className="mt-1 text-xs text-error">
                            {event.metadata.errorMessage}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
