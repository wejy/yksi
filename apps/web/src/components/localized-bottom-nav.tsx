'use client'

import { useRouter } from 'next/navigation'
import { BottomNav } from '@yksi/ui'
import { useI18n } from '@yksi/i18n/react'

const ROUTES: Record<string, string> = {
  dashboard: '/',
  tasks: '/tasks',
  calendar: '/calendar',
  stream: '/stream',
  profile: '/profile',
}

export function LocalizedBottomNav({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <BottomNav
      activeTab={activeTab}
      labels={{
        dashboard: t('nav.dashboard'),
        tasks: t('nav.tasks'),
        calendar: t('nav.calendar'),
        stream: t('nav.stream'),
        profile: t('nav.profile'),
      }}
      onTabChange={(tab) => router.push(ROUTES[tab] ?? '/')}
    />
  )
}
