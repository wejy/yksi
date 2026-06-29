// Based on ui/teht_v_lista/code.html and ui/kalenteri/code.html
import * as React from 'react'
import { cn } from '../lib/utils'
import type { LinearTaskSourceDetail, TaskPriority, TaskSource, TaskStatus } from '@yksi/core'
import { INTRESSI_LABEL, getTaskSourceMeta } from '@yksi/core'
import { PriorityBadge } from './priority-badge'

export interface TaskCardProps {
  id: string
  title: string
  description?: string | null
  priority: TaskPriority
  dueAt?: Date | null
  intressiName?: string | null
  /** @deprecated use intressiName */
  yhteispintaName?: string | null
  labels?: string[]
  source?: TaskSource
  sourceDetail?: LinearTaskSourceDetail | null
  status: TaskStatus
  onToggle?: (id: string) => void
  onClick?: (id: string) => void
  timeRange?: string
  accentColor?: 'primary' | 'tertiary' | 'secondary'
  className?: string
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Avoin',
  in_progress: 'Käynnissä',
  done: 'Valmis',
  cancelled: 'Peruttu',
}

export function TaskCard({
  id,
  title,
  description,
  priority,
  dueAt,
  intressiName,
  yhteispintaName,
  labels = [],
  source = 'native',
  sourceDetail,
  status,
  onToggle,
  onClick,
  timeRange,
  accentColor,
  className,
}: TaskCardProps) {
  const isDone = status === 'done'
  const sourceMeta = getTaskSourceMeta(source)
  const intressi = intressiName ?? yhteispintaName
  const visibleLabels = labels.slice(0, 4)
  const extraLabels = labels.length - visibleLabels.length
  const hasFooterMeta =
    !!intressi || !!sourceDetail?.teamName || !!timeRange || !!dueAt

  return (
    <div
      className={cn(
        'group flex gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md',
        accentColor && 'border-l-[3px]',
        accentColor === 'primary' && 'border-l-primary',
        accentColor === 'tertiary' && 'border-l-tertiary',
        accentColor === 'secondary' && 'border-l-secondary',
        isDone && 'opacity-65',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={() => onClick?.(id)}
      role={onClick ? 'button' : undefined}
    >
      {onToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle(id)
          }}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            isDone
              ? 'border-primary bg-primary text-on-primary'
              : 'border-outline-variant group-hover:border-primary/50',
          )}
          aria-label={isDone ? 'Merkitse avoimeksi' : 'Merkitse valmiiksi'}
        >
          {isDone && (
            <span className="material-symbols-outlined text-sm">check</span>
          )}
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'flex-1 text-base font-semibold leading-snug text-on-surface',
              isDone && 'line-through',
            )}
          >
            {title}
          </h4>
          <span className="shrink-0 rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant">
            {STATUS_LABELS[status]}
          </span>
        </div>

        {priority !== 'none' && (
          <div className="mt-1">
            <PriorityBadge priority={priority} className="text-[10px]" />
          </div>
        )}

        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant line-clamp-2">
            {description}
          </p>
        )}

        {visibleLabels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {label}
              </span>
            ))}
            {extraLabels > 0 && (
              <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] text-on-surface-variant">
                +{extraLabels}
              </span>
            )}
          </div>
        )}

        <div className="mt-2 flex items-end justify-between gap-2">
          {hasFooterMeta ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              {intressi && (
                <span className="flex items-center gap-1 font-medium text-on-surface">
                  <span className="material-symbols-outlined text-sm">target</span>
                  <span className="text-on-surface-variant">{INTRESSI_LABEL}:</span> {intressi}
                </span>
              )}
              {sourceDetail?.teamName && !intressi && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">groups</span>
                  {sourceDetail.teamName}
                </span>
              )}
              {timeRange && (
                <span className="flex items-center gap-1 font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {timeRange}
                </span>
              )}
              {dueAt && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">event</span>
                  {dueAt.toLocaleDateString('fi-FI')}
                </span>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
              sourceMeta.colorClass,
            )}
          >
            {sourceMeta.label}
          </span>
        </div>
      </div>
    </div>
  )
}
