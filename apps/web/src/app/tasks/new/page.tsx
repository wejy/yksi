'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopAppBar, Button, Input, screenBottomPaddingClass } from '@yksi/ui'
import type { TaskContentDocument } from '@yksi/core'
import { emptyTaskContent, fromDatetimeLocalValue, taskContentToPlainText } from '@yksi/core'
import { TaskContentEditor } from '@/components/task-content-editor'
import { DeadlineReminderFields } from '@/components/deadline-reminder-fields'
import { IntressiField, type IntressiOption } from '@/components/intressi-field'
import { setTaskCreatedToast } from '@/lib/task-created-toast'

export default function NewTaskPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [contentDocument, setContentDocument] = useState<TaskContentDocument>(emptyTaskContent())
  const [intressit, setIntressit] = useState<IntressiOption[]>([])
  const [intressiId, setIntressiId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [reminder, setReminder] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/yhteispinnat')
      .then((r) => r.json())
      .then((data) => setIntressit(data.intressit ?? []))
      .catch(console.error)
  }, [])

  const handleContentChange = useCallback((doc: TaskContentDocument) => {
    setContentDocument(doc)
  }, [])

  async function handleCreate() {
    if (!title.trim()) {
      setError('Tehtävä on pakollinen')
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          contentDocument,
          yhteispintaId: intressiId || null,
          dueAt: fromDatetimeLocalValue(deadline),
          reminderAt: fromDatetimeLocalValue(reminder),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Tehtävän luonti epäonnistui')
      }
      const task = await res.json()
      const description = taskContentToPlainText(contentDocument, 120) || null
      setTaskCreatedToast({ taskId: task.id, title: title.trim(), description })
      router.replace('/tasks')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tehtävän luonti epäonnistui')
      setSaving(false)
    }
  }

  return (
    <div className={`mx-auto min-h-screen max-w-2xl pt-16 ${screenBottomPaddingClass}`}>
      <TopAppBar
        title="Uusi tehtävä"
        showBack
        onBack={() => router.back()}
      />

      <main className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            Tehtävä
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mitä pitää tehdä?"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            Kuvaus
          </label>
          <p className="mb-2 text-xs text-on-surface-variant">
            Kirjoita tekstiä tai käytä / valikkoa otsikoille, tehtäville, kuville ja listoille
          </p>
          <TaskContentEditor
            value={contentDocument}
            onChange={handleContentChange}
            editable
            className="min-h-[240px] overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest"
          />
        </div>

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

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-outline-variant bg-surface-container-lowest p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="mx-auto max-w-2xl">
          <Button className="w-full" onClick={handleCreate} disabled={saving}>
            {saving ? 'Luodaan...' : 'Luo tehtävä'}
          </Button>
        </div>
      </div>
    </div>
  )
}
