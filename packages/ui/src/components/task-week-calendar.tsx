'use client'

import * as React from 'react'
import {
  filterTasksForDay,
  formatTaskTimeRange,
  getWeekDaysContaining,
  isSameCalendarDay,
  toCalendarDateKey,
  type TaskCalendarInput,
} from '@yksi/core'
import { cn } from '../lib/utils'
import { CalendarTaskCountBadge } from './calendar-task-indicator'

export interface CalendarAgendaTask extends TaskCalendarInput {
  id: string
  title: string
  description?: string | null
}

export interface TaskWeekCalendarProps<T extends CalendarAgendaTask> {
  viewDate: Date
  selectedDate: Date
  tasks: T[]
  onSelectDate: (date: Date) => void
  onTaskClick?: (task: T) => void
  className?: string
}

export function TaskWeekCalendar<T extends CalendarAgendaTask>({
  viewDate,
  selectedDate,
  tasks,
  onSelectDate,
  onTaskClick,
  className,
}: TaskWeekCalendarProps<T>) {
  const weekDays = React.useMemo(() => getWeekDaysContaining(viewDate), [viewDate])
  const today = new Date()

  return (
    <div className={cn('space-y-3', className)}>
      {weekDays.map((day) => {
        const dayTasks = filterTasksForDay(tasks, day)
        const isSelected = isSameCalendarDay(day, selectedDate)
        const isToday = isSameCalendarDay(day, today)

        return (
          <section
            key={toCalendarDateKey(day)}
            className={cn(
              'overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest',
              isSelected && 'ring-2 ring-primary/30',
            )}
          >
            <button
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                'flex w-full items-center justify-between border-b border-outline-variant px-4 py-3 text-left',
                isSelected ? 'bg-primary/5' : 'bg-surface-container-low/60',
              )}
            >
              <div>
                <p
                  className={cn(
                    'text-sm font-semibold capitalize text-on-surface',
                    isToday && 'text-primary',
                  )}
                >
                  {day.toLocaleDateString('fi-FI', { weekday: 'long' })}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {day.toLocaleDateString('fi-FI', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <CalendarTaskCountBadge count={dayTasks.length} selected={isSelected} />
            </button>

            {dayTasks.length === 0 ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant">Ei tehtäviä</p>
            ) : (
              <ul className="divide-y divide-outline-variant">
                {dayTasks.map((task, index) => {
                  const timeRange = formatTaskTimeRange(task.startAt, task.endAt, task.dueAt)
                  const accents = [
                    'border-l-primary',
                    'border-l-tertiary',
                    'border-l-secondary',
                  ] as const

                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => onTaskClick?.(task)}
                        className={cn(
                          'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low',
                          `border-l-4 ${accents[index % accents.length]}`,
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-on-surface">{task.title}</p>
                            {timeRange ? (
                              <span className="shrink-0 text-xs text-on-surface-variant">
                                {timeRange}
                              </span>
                            ) : null}
                          </div>
                          {task.description ? (
                            <p className="mt-0.5 line-clamp-2 text-sm text-on-surface-variant">
                              {task.description}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
