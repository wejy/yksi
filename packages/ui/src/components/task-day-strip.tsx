'use client'

import {
  countTasksOnDay,
  getWeekDaysContaining,
  isSameCalendarDay,
  toCalendarDateKey,
  type TaskCalendarInput,
} from '@yksi/core'
import { cn } from '../lib/utils'
import { CalendarTaskCountBadge } from './calendar-task-indicator'

export function TaskDayStrip({
  selectedDate,
  tasks,
  onSelectDate,
  className,
}: {
  selectedDate: Date
  tasks: TaskCalendarInput[]
  onSelectDate: (date: Date) => void
  className?: string
}) {
  const weekDays = getWeekDaysContaining(selectedDate)
  const today = new Date()

  return (
    <div
      className={cn(
        'rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-sm',
        className,
      )}
    >
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const isSelected = isSameCalendarDay(day, selectedDate)
          const isToday = isSameCalendarDay(day, today)
          const taskCount = countTasksOnDay(tasks, day)

          return (
            <button
              key={toCalendarDateKey(day)}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                'flex flex-col items-center rounded-lg px-1 py-2 transition-colors',
                isSelected
                  ? 'bg-primary text-on-primary shadow-sm'
                  : taskCount > 0
                    ? 'bg-primary/5 hover:bg-primary/10'
                    : 'hover:bg-surface-container-low',
                isToday && !isSelected && 'ring-1 ring-primary/30',
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase',
                  isSelected ? 'text-on-primary' : 'text-on-surface-variant',
                )}
              >
                {day.toLocaleDateString('fi-FI', { weekday: 'short' }).replace('.', '').slice(0, 2)}
              </span>
              <span className={cn('text-sm font-bold', isSelected ? 'text-on-primary' : 'text-on-surface')}>
                {day.getDate()}
              </span>
              <div className="mt-1 h-[18px]">
                {taskCount > 0 ? (
                  <CalendarTaskCountBadge count={taskCount} selected={isSelected} />
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
