'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TopAppBar, BentoSettingCard, Button, screenBottomPaddingClass } from '@yksi/ui'
import type { TaskContentDocument, LinearTaskSourceDetail, TaskSource } from '@yksi/core'
import { INTRESSI_LABEL, getTaskSourceMeta, fromDatetimeLocalValue, toDatetimeLocalValue } from '@yksi/core'
import { TaskContentEditor, TaskContentViewer } from '@/components/task-content-editor'
import { DeadlineReminderFields } from '@/components/deadline-reminder-fields'
import { IntressiField, type IntressiOption } from '@/components/intressi-field'

interface TaskDetail {
  id: string
  title: string
  description: string | null
  contentDocument: TaskContentDocument | null
  status: string
  priority: string
  dueAt: string | null
  reminderAt: string | null
  source: TaskSource
  externalUrl: string | null
  labels: string[]
  sourceDetail: LinearTaskSourceDetail | null
  yhteispinta: { id: string; name: string } | null
}

// Based on ui/teht_v_n_tiedot/code.html
export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [title, setTitle] = useState('')
  const [contentDocument, setContentDocument] = useState<TaskContentDocument | null>(null)
  const [intressit, setIntressit] = useState<IntressiOption[]>([])
  const [intressiId, setIntressiId] = useState<string>('')
  const [deadline, setDeadline] = useState('')
  const [reminder, setReminder] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/yhteispinnat')
      .then((r) => r.json())
      .then((data) => setIntressit(data.intressit ?? []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then((r) => r.json())
      .then((data: TaskDetail) => {
        setTask(data)
        setTitle(data.title)
        setContentDocument(data.contentDocument)
        setIntressiId(data.yhteispinta?.id ?? '')
        setDeadline(toDatetimeLocalValue(data.dueAt))
        setReminder(toDatetimeLocalValue(data.reminderAt))
      })
      .catch(console.error)
  }, [id])

  const handleContentChange = useCallback((doc: TaskContentDocument) => {
    setContentDocument(doc)
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        contentDocument,
        yhteispintaId: intressiId || null,
        dueAt: fromDatetimeLocalValue(deadline),
        reminderAt: fromDatetimeLocalValue(reminder),
      }),
    })
    setSaving(false)
    router.back()
  }

  async function toggleDone() {
    if (!task) return
    const newStatus = task.status === 'done' ? 'open' : 'done'
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setTask({ ...task, status: newStatus })
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-on-surface-variant">Ladataan...</p>
      </div>
    )
  }

  const isNative = task.source === 'native'
  const sourceMeta = getTaskSourceMeta(task.source)

  return (
    <div className={`mx-auto min-h-screen max-w-2xl pt-16 ${screenBottomPaddingClass}`}>
      <TopAppBar
        title="Tehtävän tiedot"
        showBack
        onBack={() => router.back()}
      />

      <main className="space-y-6 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${sourceMeta.colorClass}`}
          >
            <span className="material-symbols-outlined text-sm">{sourceMeta.icon}</span>
            {sourceMeta.label}
          </span>
          {task.sourceDetail?.stateName && (
            <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant">
              {task.sourceDetail.stateName}
            </span>
          )}
          {task.externalUrl ? (
            <a
              href={task.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-primary underline"
            >
              Avaa lähteessä
            </a>
          ) : null}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={!isNative}
          className="w-full border-none bg-transparent text-2xl font-bold text-on-surface focus:outline-none read-only:opacity-90"
        />

        <section>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant">
            Sisältö
          </h3>
          {isNative ? (
            <TaskContentEditor
              key={task.id}
              value={contentDocument}
              onChange={handleContentChange}
              editable
              className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest"
            />
          ) : (
            <TaskContentViewer value={contentDocument} />
          )}
          {!isNative ? (
            <p className="mt-2 text-xs text-on-surface-variant">
              Linear- ja Notion-tehtävien sisältö synkataan lähteestä. Muokkaa sisältöä siellä.
            </p>
          ) : null}
        </section>

        {task.labels.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant">
              Labelit
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {label}
                </span>
              ))}
            </div>
          </section>
        )}

        {isNative ? (
          <IntressiField
            intressit={intressit}
            value={intressiId}
            onChange={setIntressiId}
            onCreated={(intressi) => setIntressit((prev) => [...prev, intressi])}
          />
        ) : (
          <BentoSettingCard
            icon="target"
            label={INTRESSI_LABEL}
            value={task.yhteispinta?.name ?? task.sourceDetail?.projectName ?? 'Ei valittu'}
          />
        )}

        {isNative ? (
          <DeadlineReminderFields
            deadline={deadline}
            reminder={reminder}
            onDeadlineChange={setDeadline}
            onReminderChange={setReminder}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <BentoSettingCard
              icon="notifications"
              label="Hälytysaika"
              value={
                task.reminderAt
                  ? new Date(task.reminderAt).toLocaleString('fi-FI', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Ei asetettu'
              }
            />
            <BentoSettingCard
              icon="event"
              label="Deadline"
              value={
                task.dueAt
                  ? new Date(task.dueAt).toLocaleString('fi-FI', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Ei asetettu'
              }
            />
          </div>
        )}

        {task.sourceDetail?.teamName && (
          <p className="text-sm text-on-surface-variant">
            Linear-tiimi: {task.sourceDetail.teamName}
          </p>
        )}

        <Button
          variant={task.status === 'done' ? 'outline' : 'default'}
          className="w-full"
          onClick={toggleDone}
        >
          {task.status === 'done' ? 'Merkitse avoimeksi' : 'Merkitse valmiiksi'}
        </Button>
      </main>

      {isNative ? (
        <div className="fixed bottom-0 left-0 right-0 border-t border-outline-variant bg-surface-container-lowest p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
          <div className="mx-auto max-w-2xl">
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? 'Tallennetaan...' : 'Tallenna muutokset'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
