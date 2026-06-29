'use client'

import * as React from 'react'
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
} from 'react-day-picker'
import { fi } from 'react-day-picker/locale'
import {
  getTaskOccurrenceDate,
  toCalendarDateKey,
  type TaskCalendarInput,
} from '@yksi/core'
import { cn } from '../lib/utils'

function getTaskDates(tasks: TaskCalendarInput[]): Date[] {
  const seen = new Set<string>()
  const dates: Date[] = []
  for (const task of tasks) {
    const d = getTaskOccurrenceDate(task)
    if (!d) continue
    const key = toCalendarDateKey(d)
    if (seen.has(key)) continue
    seen.add(key)
    dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
  }
  return dates
}

function TaskDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={cn(
        'relative flex aspect-square w-full items-center justify-center rounded-lg text-sm font-medium transition-colors',
        modifiers.selected &&
          'z-10 scale-110 bg-primary font-bold text-on-primary shadow-md shadow-primary/20',
        modifiers.today && !modifiers.selected && 'text-primary ring-2 ring-primary/30',
        modifiers.outside && !modifiers.selected && 'text-on-surface-variant/40',
        !modifiers.selected &&
          !modifiers.outside &&
          'text-on-surface hover:bg-surface-container-low',
        className,
      )}
    >
      {day.date.getDate()}
      {modifiers.hasTask ? (
        <span
          className={cn(
            'absolute bottom-1.5 h-1 w-1 rounded-full',
            modifiers.selected ? 'bg-on-primary' : 'bg-primary',
          )}
        />
      ) : null}
    </button>
  )
}

export interface TaskMonthCalendarProps {
  viewDate: Date
  selectedDate: Date
  tasks: TaskCalendarInput[]
  onSelectDate: (date: Date) => void
  onMonthChange: (date: Date) => void
  className?: string
}

export function TaskMonthCalendar({
  viewDate,
  selectedDate,
  tasks,
  onSelectDate,
  onMonthChange,
  className,
}: TaskMonthCalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  const taskDates = React.useMemo(() => getTaskDates(tasks), [tasks])

  return (
    <div
      className={cn(
        'rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm',
        className,
      )}
    >
      <DayPicker
        mode="single"
        locale={fi}
        weekStartsOn={1}
        showOutsideDays
        fixedWeeks
        hideNavigation
        month={viewDate}
        onMonthChange={onMonthChange}
        selected={selectedDate}
        onSelect={(date) => {
          if (date) onSelectDate(date)
        }}
        modifiers={{ hasTask: taskDates }}
        className="w-full"
        classNames={{
          ...defaultClassNames,
          root: cn('w-full', defaultClassNames.root),
          months: cn('flex w-full flex-col', defaultClassNames.months),
          month: cn('w-full', defaultClassNames.month),
          month_caption: 'hidden',
          nav: 'hidden',
          month_grid: 'w-full border-collapse',
          weekdays: cn('flex w-full', defaultClassNames.weekdays),
          weekday: cn(
            'flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wide text-on-surface-variant',
            defaultClassNames.weekday,
          ),
          week: cn('mt-1 flex w-full', defaultClassNames.week),
          day: cn('flex-1 p-0.5 text-center', defaultClassNames.day),
          day_button: cn('mx-auto w-full', defaultClassNames.day_button),
        }}
        formatters={{
          formatWeekdayName: (date) =>
            date
              .toLocaleDateString('fi-FI', { weekday: 'short' })
              .replace('.', '')
              .slice(0, 2)
              .toUpperCase(),
        }}
        components={{
          DayButton: TaskDayButton,
        }}
      />
    </div>
  )
}
