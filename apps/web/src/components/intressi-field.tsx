'use client'

import { useState } from 'react'
import { Button, Input } from '@yksi/ui'
import {
  INTRESSI_COLOR_PRESETS,
  INTRESSI_ICON_PRESETS,
  INTRESSI_LABEL,
} from '@yksi/core'

export interface IntressiOption {
  id: string
  name: string
  color?: string | null
  icon?: string | null
}

interface IntressiFieldProps {
  intressit: IntressiOption[]
  value: string
  onChange: (id: string) => void
  onCreated: (intressi: IntressiOption) => void
}

function IntressiPreview({
  name,
  color,
  icon,
}: {
  name: string
  color: string | null
  icon: string | null
}) {
  if (!name.trim()) return null

  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2">
      <span className="text-xs text-on-surface-variant">Esikatselu</span>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-on-surface"
        style={{ backgroundColor: color ? `${color}22` : undefined }}
      >
        {color ? (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        ) : null}
        {icon ? (
          <span className="material-symbols-outlined text-sm" style={{ color: color ?? undefined }}>
            {icon}
          </span>
        ) : null}
        {name.trim()}
      </span>
    </div>
  )
}

export function IntressiField({ intressit, value, onChange, onCreated }: IntressiFieldProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<string | null>(null)
  const [newIcon, setNewIcon] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const selected = intressit.find((item) => item.id === value)

  function resetCreateForm() {
    setNewName('')
    setNewColor(null)
    setNewIcon(null)
    setCreateError('')
  }

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
        body: JSON.stringify({
          name,
          color: newColor,
          icon: newIcon,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Intressin luonti epäonnistui')
      }
      const created = (await res.json()) as IntressiOption
      onCreated(created)
      onChange(created.id)
      resetCreateForm()
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

      {selected && (selected.color || selected.icon) ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
          {selected.color ? (
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: selected.color }}
              aria-hidden
            />
          ) : null}
          {selected.icon ? (
            <span className="material-symbols-outlined text-sm">{selected.icon}</span>
          ) : null}
          <span>Valittu intressi</span>
        </div>
      ) : null}

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
          <p className="mb-2 text-xs font-medium text-on-surface">Uusi intressi</p>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Esim. Asiakas X"
            className="mb-3"
          />

          <div className="mb-3">
            <p className="mb-2 text-xs text-on-surface-variant">Väri (valinnainen)</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setNewColor(null)}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs ${
                  newColor === null
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-outline-variant bg-surface-container-lowest'
                }`}
                aria-label="Ei väriä"
                title="Ei väriä"
              >
                —
              </button>
              {INTRESSI_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setNewColor(preset.hex)}
                  className={`h-8 w-8 rounded-md border-2 transition-transform hover:scale-105 ${
                    newColor === preset.hex ? 'border-on-surface scale-105' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  aria-label={preset.label}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 text-xs text-on-surface-variant">Kuvake (valinnainen)</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setNewIcon(null)}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs ${
                  newIcon === null
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                }`}
                aria-label="Ei kuvaketta"
                title="Ei kuvaketta"
              >
                —
              </button>
              {INTRESSI_ICON_PRESETS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewIcon(icon)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                    newIcon === icon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                  }`}
                  aria-label={icon}
                  title={icon}
                >
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <IntressiPreview name={newName} color={newColor} icon={newIcon} />

          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? '...' : 'Luo intressi'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false)
                resetCreateForm()
              }}
              className="px-2 text-xs text-on-surface-variant underline"
            >
              Peruuta
            </button>
          </div>
          {createError ? <p className="mt-2 text-xs text-error">{createError}</p> : null}
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
