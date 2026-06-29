// Based on ui/teht_v_lista/code.html and ui/kalenteri/code.html
import * as React from 'react'
import { cn } from '../lib/utils'
import type { TaskPriority, TaskStatus } from '@yksi/core'
import { PriorityBadge } from './priority-badge'

export interface TaskCardProps {
  id: string
  title: string
  description?: string | null
  priority: TaskPriority
  dueAt?: Date | null
  yhteispintaName?: string | null
  status: TaskStatus
  onToggle?: (id: string) => void
  onClick?: (id: string) => void
  timeRange?: string
  accentColor?: 'primary' | 'tertiary' | 'secondary'
  className?: string
}

export function TaskCard({
  id,
  title,
  description,
  priority,
  dueAt,
  yhteispintaName,
  status,
  onToggle,
  onClick,
  timeRange,
  accentColor,
  className,
}: TaskCardProps) {
  const isDone = status === 'done'

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-all hover:border-primary/30 hover:shadow-sm',
        accentColor && 'border-l-[3px]',
        accentColor === 'primary' && 'border-l-primary',
        accentColor === 'tertiary' && 'border-l-tertiary',
        accentColor === 'secondary' && 'border-l-secondary',
        isDone && 'opacity-60',
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
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
            isDone
              ? 'border-primary bg-primary text-on-primary'
              : 'border-outline-variant hover:border-primary',
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
              'font-semibold text-on-surface',
              isDone && 'line-through',
            )}
          >
            {title}
          </h4>
          <PriorityBadge priority={priority} />
        </div>
        {description && (
          <p className="mt-1 text-sm text-on-surface-variant line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
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
          {yhteispintaName && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">folder</span>
              {yhteispintaName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
