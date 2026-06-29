import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { fabOffsetClass } from '../tokens'
import {
  TASK_SORT_BY_OPTIONS,
  TASK_SORT_ORDER_OPTIONS,
  type TaskSortBy,
  type TaskSortOrder,
} from '@yksi/core'

export interface TaskSortState {
  sortBy: TaskSortBy
  sortOrder: TaskSortOrder
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Etsi tehtäviä...',
  className,
  sort,
  onSortChange,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  sort?: TaskSortState
  onSortChange?: (sort: TaskSortState) => void
}) {
  const [sortOpen, setSortOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const sortPanelId = useId()

  useEffect(() => {
    if (!sortOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [sortOpen])

  return (
    <div className={cn('relative flex gap-2', className)} ref={panelRef}>
      <div className="relative min-w-0 flex-1">
        <span
          className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] leading-none text-on-surface-variant"
          aria-hidden
        >
          search
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low py-2.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {sort && onSortChange ? (
        <>
          <button
            type="button"
            onClick={() => setSortOpen((open) => !open)}
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant transition-colors hover:bg-surface-container-low',
              sortOpen && 'border-primary/40 bg-surface-container-low',
            )}
            aria-label="Järjestä tehtävät"
            aria-expanded={sortOpen}
            aria-controls={sortPanelId}
          >
            <span className="material-symbols-outlined text-[22px] leading-none">sort</span>
          </button>

          {sortOpen ? (
            <div
              id={sortPanelId}
              className="absolute right-0 top-full z-30 mt-2 w-[min(100%,18rem)] rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-lg"
            >
              <p className="mb-3 text-sm font-semibold text-on-surface">Järjestä</p>

              <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                Järjestys
              </label>
              <select
                value={sort.sortBy}
                onChange={(e) =>
                  onSortChange({ ...sort, sortBy: e.target.value as TaskSortBy })
                }
                className="mb-3 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface"
              >
                {TASK_SORT_BY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                Suunta
              </label>
              <select
                value={sort.sortOrder}
                onChange={(e) =>
                  onSortChange({ ...sort, sortOrder: e.target.value as TaskSortOrder })
                }
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface"
              >
                {TASK_SORT_ORDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
      )}
    >
      {label}
    </button>
  )
}

export function Fab({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform active:scale-95',
        fabOffsetClass,
        className,
      )}
      aria-label="Lisää tehtävä"
    >
      <span className="material-symbols-outlined text-2xl">add</span>
    </button>
  )
}
