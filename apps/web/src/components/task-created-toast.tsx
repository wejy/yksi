'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@yksi/i18n/react'
import { consumeTaskCreatedToast, type TaskCreatedToastPayload } from '@/lib/task-created-toast'

const TOAST_DURATION_MS = 8000

export function TaskCreatedToast() {
  const router = useRouter()
  const { t } = useI18n()
  const [toast, setToast] = useState<TaskCreatedToastPayload | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const payload = consumeTaskCreatedToast()
    if (!payload) return

    setToast(payload)
    setVisible(true)

    const timer = window.setTimeout(() => setVisible(false), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible || !toast) return null

  const message = toast.description
    ? t('tasks.createdToast', { title: toast.title, description: toast.description })
    : t('tasks.createdToastNoDescription', { title: toast.title })

  const taskId = toast.taskId

  function openTask() {
    setVisible(false)
    router.push(`/task/${taskId}`)
  }

  function dismiss(event: MouseEvent) {
    event.stopPropagation()
    setVisible(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-4 right-4 z-50 mx-auto max-w-2xl bottom-[calc(4rem+1rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="relative rounded-xl border border-primary/25 bg-primary/5 shadow-lg">
        <button
          type="button"
          onClick={openTask}
          className="flex w-full items-start gap-3 rounded-xl px-4 py-3 pr-10 text-left transition-colors hover:bg-primary/10"
        >
          <span
            className="material-symbols-outlined mt-0.5 shrink-0 text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            check_circle
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-on-surface">{message}</span>
            <span className="mt-0.5 block text-xs text-primary">{t('tasks.createdToastAction')}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('tasks.createdToastDismiss')}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/15 hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            close
          </span>
        </button>
      </div>
    </div>
  )
}
