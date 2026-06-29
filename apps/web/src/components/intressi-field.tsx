'use client'

import { useState } from 'react'
import { Button, Input } from '@yksi/ui'
import { INTRESSI_LABEL } from '@yksi/core'

export interface IntressiOption {
  id: string
  name: string
}

interface IntressiFieldProps {
  intressit: IntressiOption[]
  value: string
  onChange: (id: string) => void
  onCreated: (intressi: IntressiOption) => void
}

export function IntressiField({ intressit, value, onChange, onCreated }: IntressiFieldProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function handleCreate() {
    const name = newName.trim()
    if (!name) {
      setCreateError('Nimi on pakollinen')
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/yhteispinnat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Intressin luonti epäonnistui')
      }
      const created = (await res.json()) as IntressiOption
      onCreated(created)
      onChange(created.id)
      setNewName('')
      setShowCreate(false)
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Intressin luonti epäonnistui')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-on-surface-variant">
        {INTRESSI_LABEL}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface"
      >
        <option value="">Ei intressiä</option>
        {intressit.map((intressi) => (
          <option key={intressi.id} value={intressi.id}>
            {intressi.name}
          </option>
        ))}
      </select>

      {!showCreate ? (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="mt-2 text-xs font-medium text-primary underline hover:text-primary/80"
        >
          + Luo uusi intressi
        </button>
      ) : (
        <div className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
          <p className="mb-2 text-xs text-on-surface-variant">Uusi intressi</p>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Esim. Asiakas X"
              className="flex-1"
            />
            <Button type="button" size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? '...' : 'Luo'}
            </Button>
          </div>
          {createError ? <p className="mt-1 text-xs text-error">{createError}</p> : null}
          <button
            type="button"
            onClick={() => {
              setShowCreate(false)
              setCreateError('')
            }}
            className="mt-2 text-xs text-on-surface-variant underline"
          >
            Peruuta
          </button>
        </div>
      )}

      {intressit.length === 0 && !showCreate ? (
        <p className="mt-1 text-xs text-on-surface-variant">
          Intressit syntyvät myös Linear-projekteista tai Notion-tietokannoista synkan yhteydessä.
        </p>
      ) : null}
    </div>
  )
}
