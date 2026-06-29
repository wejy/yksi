import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { CategoryChip } from './search-bar'
import {
  INTRESSI_FILTER_CHIP_LIMIT,
  INTRESSI_LABEL,
  formatFilterCountLabel,
} from '@yksi/core'

export interface IntressiFilterOption {
  id: string
  name: string
  taskCount: number
  color?: string | null
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

function intressiSummary(
  intressit: IntressiFilterOption[],
  activeIds: string[],
): string {
  if (activeIds.length === 0) return 'Kaikki intressit'
  if (activeIds.length === 1) {
    const item = intressit.find((i) => i.id === activeIds[0])
    return item ? formatFilterCountLabel(item.name, item.taskCount) : '1 intressi'
  }
  return `${activeIds.length} intressiä valittu`
}

export function IntressiFilter({
  intressit,
  activeIds,
  onActiveIdsChange,
  chipLimit = INTRESSI_FILTER_CHIP_LIMIT,
  className,
}: {
  intressit: IntressiFilterOption[]
  activeIds: string[]
  onActiveIdsChange: (ids: string[]) => void
  chipLimit?: number
  className?: string
}) {
  if (intressit.length === 0) return null

  if (intressit.length <= chipLimit) {
    return (
      <IntressiChipRow
        intressit={intressit}
        activeIds={activeIds}
        onActiveIdsChange={onActiveIdsChange}
        className={className}
      />
    )
  }

  return (
    <IntressiCombobox
      intressit={intressit}
      activeIds={activeIds}
      onActiveIdsChange={onActiveIdsChange}
      className={className}
    />
  )
}

function IntressiChipRow({
  intressit,
  activeIds,
  onActiveIdsChange,
  className,
}: {
  intressit: IntressiFilterOption[]
  activeIds: string[]
  onActiveIdsChange: (ids: string[]) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      <CategoryChip
        label="Kaikki intressit"
        active={activeIds.length === 0}
        onClick={() => onActiveIdsChange([])}
      />
      {intressit.map((intressi) => (
        <CategoryChip
          key={intressi.id}
          label={intressi.name}
          count={intressi.taskCount}
          active={activeIds.includes(intressi.id)}
          onClick={() => onActiveIdsChange(toggleId(activeIds, intressi.id))}
        />
      ))}
    </div>
  )
}

function IntressiCombobox({
  intressit,
  activeIds,
  onActiveIdsChange,
  className,
}: {
  intressit: IntressiFilterOption[]
  activeIds: string[]
  onActiveIdsChange: (ids: string[]) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return intressit
    return intressit.filter((item) => item.name.toLowerCase().includes(q))
  }, [intressit, query])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const selectedItems = intressit.filter((item) => activeIds.includes(item.id))

  return (
    <div className={cn('relative', className)} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm transition-colors',
          open || activeIds.length > 0
            ? 'border-primary/35 bg-primary/5 text-on-surface'
            : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
        )}
      >
        <span className="min-w-0 truncate font-medium">
          {intressiSummary(intressit, activeIds)}
        </span>
        <span className="material-symbols-outlined shrink-0 text-xl leading-none">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg"
        >
          <div className="border-b border-outline-variant p-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Etsi ${INTRESSI_LABEL.toLowerCase()}ä...`}
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>

          <button
            type="button"
            onClick={() => onActiveIdsChange([])}
            className={cn(
              'flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-surface-container-low',
              activeIds.length === 0 && 'bg-primary/8 font-medium text-primary',
            )}
          >
            <span>Kaikki intressit</span>
            <span className="tabular-nums text-on-surface-variant">
              {intressit.reduce((sum, item) => sum + item.taskCount, 0)}
            </span>
          </button>

          <ul className="max-h-64 overflow-y-auto border-t border-outline-variant">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-on-surface-variant">
                Ei hakutuloksia
              </li>
            ) : (
              filtered.map((item) => {
                const selected = activeIds.includes(item.id)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onActiveIdsChange(toggleId(activeIds, item.id))}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-container-low',
                        selected && 'bg-primary/8',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded border',
                          selected
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-outline-variant bg-surface-container-lowest',
                        )}
                      >
                        {selected ? (
                          <span className="material-symbols-outlined text-sm leading-none">check</span>
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-on-surface">
                        {item.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-on-surface-variant">
                        ({item.taskCount})
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}

      {selectedItems.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onActiveIdsChange(activeIds.filter((id) => id !== item.id))}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {formatFilterCountLabel(item.name, item.taskCount)}
              <span className="material-symbols-outlined text-sm leading-none">close</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
