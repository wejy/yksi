import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import {
  TASK_SORT_BY_OPTIONS,
  TASK_SORT_ORDER_OPTIONS,
  formatFilterCountLabel,
  type TaskSortBy,
  type TaskSortOrder,
  type TaskSource,
} from '@yksi/core'

export interface TaskSortState {
  sortBy: TaskSortBy
  sortOrder: TaskSortOrder
}

export interface TaskSourceFilterOption {
  source: TaskSource
  label: string
  icon: string
  taskCount: number
  connected: boolean
}

function ToolbarButton({
  icon,
  label,
  active,
  onClick,
  expanded,
  controlsId,
}: {
  icon: string
  label: string
  active?: boolean
  onClick: () => void
  expanded?: boolean
  controlsId?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controlsId}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
        active || expanded
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
      )}
    >
      <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>
      {label}
    </button>
  )
}

export function TaskListControls({
  sort,
  onSortChange,
  availableSources,
  activeSources,
  onActiveSourcesChange,
  className,
}: {
  sort: TaskSortState
  onSortChange: (sort: TaskSortState) => void
  availableSources: TaskSourceFilterOption[]
  activeSources: TaskSource[]
  onActiveSourcesChange: (sources: TaskSource[]) => void
  className?: string
}) {
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const sortPanelId = useId()
  const filterPanelId = useId()

  const sourcesFiltered = activeSources.length > 0
  const sourceButtonLabel =
    activeSources.length === 1
      ? (() => {
          const option = availableSources.find((s) => s.source === activeSources[0])
          return option ? formatFilterCountLabel(option.label, option.taskCount) : 'Lähde'
        })()
      : activeSources.length > 1
        ? `${activeSources.length} lähdettä`
        : 'Lähde'

  useEffect(() => {
    if (!sortOpen && !filterOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setSortOpen(false)
        setFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [sortOpen, filterOpen])

  function toggleSource(source: TaskSource) {
    if (activeSources.includes(source)) {
      onActiveSourcesChange(activeSources.filter((s) => s !== source))
    } else {
      onActiveSourcesChange([...activeSources, source])
    }
  }

  if (availableSources.length === 0) {
    return (
      <div className={cn('relative', className)} ref={rootRef}>
        <ToolbarButton
          icon="sort"
          label="Järjestä"
          active={sortOpen}
          expanded={sortOpen}
          controlsId={sortPanelId}
          onClick={() => {
            setFilterOpen(false)
            setSortOpen((open) => !open)
          }}
        />
        {sortOpen ? (
          <div
            id={sortPanelId}
            className="mt-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
          >
            <SortPanel sort={sort} onSortChange={onSortChange} />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} ref={rootRef}>
      <div className="flex flex-wrap gap-2">
        <ToolbarButton
          icon="filter_list"
          label={sourceButtonLabel}
          active={sourcesFiltered}
          expanded={filterOpen}
          controlsId={filterPanelId}
          onClick={() => {
            setSortOpen(false)
            setFilterOpen((open) => !open)
          }}
        />
        <ToolbarButton
          icon="sort"
          label="Järjestä"
          expanded={sortOpen}
          controlsId={sortPanelId}
          onClick={() => {
            setFilterOpen(false)
            setSortOpen((open) => !open)
          }}
        />
      </div>

      {filterOpen ? (
        <div
          id={filterPanelId}
          className="mt-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
        >
          <p className="mb-3 text-sm font-semibold text-on-surface">Lähteet</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onActiveSourcesChange([])}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                !sourcesFiltered
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
              )}
            >
              Kaikki lähteet
            </button>
            {availableSources.map((option) => {
              const selected = activeSources.includes(option.source)
              const label = formatFilterCountLabel(option.label, option.taskCount)
              return (
                <button
                  key={option.source}
                  type="button"
                  onClick={() => toggleSource(option.source)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium tabular-nums transition-colors',
                    selected
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
                  )}
                >
                  <span className="material-symbols-outlined text-base leading-none">
                    {option.icon}
                  </span>
                  {label}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-on-surface-variant">
            Näytetään vain yhdistetyt integraatiot ja lähteet joissa on tehtäviä.
          </p>
        </div>
      ) : null}

      {sortOpen ? (
        <div
          id={sortPanelId}
          className="mt-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
        >
          <SortPanel sort={sort} onSortChange={onSortChange} />
        </div>
      ) : null}
    </div>
  )
}

function SortPanel({
  sort,
  onSortChange,
}: {
  sort: TaskSortState
  onSortChange: (sort: TaskSortState) => void
}) {
  return (
    <>
      <p className="mb-3 text-sm font-semibold text-on-surface">Järjestä</p>

      <label className="mb-1 block text-xs font-medium text-on-surface-variant">Järjestys</label>
      <select
        value={sort.sortBy}
        onChange={(e) => onSortChange({ ...sort, sortBy: e.target.value as TaskSortBy })}
        className="mb-3 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface"
      >
        {TASK_SORT_BY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-xs font-medium text-on-surface-variant">Suunta</label>
      <select
        value={sort.sortOrder}
        onChange={(e) => onSortChange({ ...sort, sortOrder: e.target.value as TaskSortOrder })}
        className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface"
      >
        {TASK_SORT_ORDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}
