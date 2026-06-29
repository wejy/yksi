'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopAppBar, StreamTimeline, bottomNavPaddingClass } from '@yksi/ui'
import { LocalizedBottomNav } from '@/components/localized-bottom-nav'
import { useI18n } from '@yksi/i18n/react'
import type { ActivityEvent } from '@yksi/core'

// Virta — activity stream
export default function StreamPage() {
  const router = useRouter()
  const { t, locale } = useI18n()
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stream?limit=100')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stream')
        return r.json()
      })
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  function handleEventClick(event: ActivityEvent) {
    if (event.entityType === 'task' && event.entityId) {
      router.push(`/task/${event.entityId}`)
    }
  }

  return (
    <div className={`mx-auto min-h-screen max-w-2xl pt-16 ${bottomNavPaddingClass}`}>
      <TopAppBar onNotifications={() => {}} />

      <main className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-on-surface">{t('stream.title')}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t('stream.subtitle')}</p>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">{t('common.loading')}</p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-error">{error}</p>
        ) : (
          <StreamTimeline
            events={events}
            onEventClick={handleEventClick}
            locale={locale === 'en' ? 'en-GB' : 'fi-FI'}
            emptyTitle={t('stream.empty')}
            emptyHint={t('stream.emptyHint')}
          />
        )}
      </main>

      <LocalizedBottomNav activeTab="stream" />
    </div>
  )
}
