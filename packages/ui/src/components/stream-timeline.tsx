'use client'

import {
  groupActivityEventsByDay,
  formatActivityTime,
  getActivityIcon,
  type ActivityEvent,
} from '@yksi/core'
import { cn } from '../lib/utils'

const ACTIVITY_COLORS: Record<ActivityEvent['type'], string> = {
  task_created: 'bg-primary-container text-on-primary-container',
  task_updated: 'bg-secondary-container text-on-secondary-container',
  task_deleted: 'bg-error-container text-on-error-container',
  integration_sync: 'bg-tertiary-container text-on-tertiary-container',
  integration_connected: 'bg-tertiary-container text-on-tertiary-container',
  profile_updated: 'bg-surface-container-high text-on-surface',
}

export function StreamTimeline({
  events,
  onEventClick,
  className,
  locale = 'fi-FI',
  emptyTitle = 'Ei vielä tapahtumia',
  emptyHint = 'Tehtävät, synkronoinnit ja profiilimuutokset näkyvät täällä.',
}: {
  events: ActivityEvent[]
  onEventClick?: (event: ActivityEvent) => void
  className?: string
  locale?: string
  emptyTitle?: string
  emptyHint?: string
}) {
  const groups = groupActivityEventsByDay(events, 'Europe/Helsinki', locale)

  if (groups.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <span className="material-symbols-outlined mb-3 text-4xl text-on-surface-variant">
          history
        </span>
        <p className="text-sm text-on-surface-variant">{emptyTitle}</p>
        <p className="mt-1 text-xs text-outline">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      {groups.map((group) => (
        <section key={group.dateKey}>
          <h3
            className={cn(
              'mb-3 text-sm font-semibold capitalize',
              group.isToday ? 'text-primary' : 'text-on-surface-variant',
            )}
          >
            {group.label}
          </h3>
          <div className="relative space-y-3 pl-6">
            <div className="absolute bottom-2 left-[11px] top-2 w-px bg-outline-variant/60" />
            {group.events.map((event) => {
              const clickable = Boolean(onEventClick && event.entityType === 'task' && event.entityId)
              const Wrapper = clickable ? 'button' : 'div'

              return (
                <Wrapper
                  key={event.id}
                  type={clickable ? 'button' : undefined}
                  onClick={clickable ? () => onEventClick?.(event) : undefined}
                  className={cn(
                    'relative flex w-full gap-3 text-left',
                    clickable && 'rounded-xl transition-colors hover:bg-surface-container-low',
                  )}
                >
                  <div
                    className={cn(
                      'absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full',
                      ACTIVITY_COLORS[event.type],
                    )}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {getActivityIcon(event.type)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-on-surface">{event.summary}</p>
                      <time className="shrink-0 text-xs text-on-surface-variant">
                        {formatActivityTime(event.createdAt, locale)}
                      </time>
                    </div>
                    {event.type === 'integration_sync' &&
                    typeof event.metadata.status === 'string' &&
                    event.metadata.status === 'error' ? (
                      <p className="mt-1 text-xs text-error">
                        {typeof event.metadata.errorMessage === 'string'
                          ? event.metadata.errorMessage
                          : 'Synkronointi epäonnistui'}
                      </p>
                    ) : null}
                  </div>
                </Wrapper>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
