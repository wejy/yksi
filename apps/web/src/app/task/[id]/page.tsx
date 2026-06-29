'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  TopAppBar,
  BentoSettingCard,
  Button,
  Input,
} from '@yksi/ui'

interface TaskDetail {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueAt: string | null
  reminderAt: string | null
  source: string
  yhteispinta: { name: string } | null
}

// Based on ui/teht_v_n_tiedot/code.html
export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTask(data)
        setTitle(data.title)
        setDescription(data.description ?? '')
      })
      .catch(console.error)
  }, [id])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    setSaving(false)
    router.back()
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-on-surface-variant">Ladataan...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-24 pt-16">
      <TopAppBar
        title="Tehtävän tiedot"
        showBack
        onBack={() => router.back()}
      />

      <main className="space-y-6 p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-none bg-transparent text-2xl font-bold text-on-surface focus:outline-none"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kuvaus..."
          rows={4}
          className="w-full resize-none rounded-lg border border-outline-variant bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="grid grid-cols-3 gap-3">
          <BentoSettingCard
            icon="notifications"
            label="Muistutus"
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
            label="Määräpäivä"
            value={
              task.dueAt
                ? new Date(task.dueAt).toLocaleDateString('fi-FI', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Ei asetettu'
            }
          />
          <BentoSettingCard
            icon="folder"
            label="Yhteispinta"
            value={task.yhteispinta?.name ?? 'Ei valittu'}
          />
        </div>

        <p className="text-xs text-on-surface-variant">
          Lähde: {task.source}
        </p>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-outline-variant bg-surface-container-lowest p-4">
        <div className="mx-auto max-w-2xl">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Tallennetaan...' : 'Tallenna muutokset'}
          </Button>
        </div>
      </div>
    </div>
  )
}
