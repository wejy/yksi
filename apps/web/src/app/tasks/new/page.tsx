'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopAppBar, Button, Input } from '@yksi/ui'

export default function NewTaskPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!title.trim()) {
      setError('Otsikko on pakollinen')
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
          description: description.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Tehtävän luonti epäonnistui')
      }
      const task = await res.json()
      router.replace(`/task/${task.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tehtävän luonti epäonnistui')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-24 pt-16">
      <TopAppBar
        title="Uusi tehtävä"
        showBack
        onBack={() => router.back()}
      />

      <main className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            Otsikko
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
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Lisätiedot (valinnainen)"
            rows={4}
            className="w-full resize-none rounded-lg border border-outline-variant bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-outline-variant bg-surface-container-lowest p-4">
        <div className="mx-auto max-w-2xl">
          <Button className="w-full" onClick={handleCreate} disabled={saving}>
            {saving ? 'Luodaan...' : 'Luo tehtävä'}
          </Button>
        </div>
      </div>
    </div>
  )
}
