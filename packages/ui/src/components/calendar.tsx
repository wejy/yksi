// Based on ui/kalenteri/code.html
import * as React from 'react'
import { cn } from '../lib/utils'

const WEEKDAYS = ['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU']

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  taskCount: number
}

export function CalendarGrid({
  days,
  onDayClick,
  className,
}: {
  days: CalendarDay[]
  onDayClick: (date: Date) => void
  className?: string
}) {
  return (
    <div className={cn('', className)}>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs font-medium text-on-surface-variant"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <button
            key={day.date.toISOString()}
            type="button"
            onClick={() => onDayClick(day.date)}
            className={cn(
              'flex flex-col items-center rounded-lg py-2 text-sm transition-colors',
              !day.isCurrentMonth && 'text-on-surface-variant/40',
              day.isSelected && 'bg-primary text-on-primary',
              day.isToday && !day.isSelected && 'ring-2 ring-primary/30',
              !day.isSelected && 'hover:bg-surface-container-low',
            )}
          >
            <span className="font-medium">{day.date.getDate()}</span>
            {day.taskCount > 0 && (
              <span
                className={cn(
                  'mt-0.5 h-1 w-1 rounded-full',
                  day.isSelected ? 'bg-on-primary' : 'bg-primary',
                )}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ProgressRing({
  completed,
  total,
  size = 120,
  className,
}: {
  completed: number
  total: number
  size?: number
  className?: string
}) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? completed / total : 0
  const offset = circumference - progress * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-surface-container"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-on-surface">
          {completed}/{total}
        </span>
        <span className="text-xs text-on-surface-variant">valmis</span>
      </div>
    </div>
  )
}
