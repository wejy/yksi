'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@yksi/i18n/react'
import { consumeTaskCreatedToast, type TaskCreatedToastPayload } from '@/lib/task-created-toast'

const TOAST_DURATION_MS = 5000

export function TaskCreatedToast() {
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

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-4 right-4 z-50 mx-auto max-w-2xl bottom-[calc(4rem+1rem+env(safe-area-inset-bottom,0px))]"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="flex w-full items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-left shadow-lg"
      >
        <span
          className="material-symbols-outlined mt-0.5 shrink-0 text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          check_circle
        </span>
        <span className="text-sm text-on-surface">{message}</span>
      </button>
    </div>
  )
}
