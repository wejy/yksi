export const CALENDAR_WEEKDAYS_FI = ['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU'] as const

export interface CalendarDayCell {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  taskCount: number
}

export interface TaskCalendarInput {
  startAt?: string | Date | null
  dueAt?: string | Date | null
  reminderAt?: string | Date | null
}

export function getTaskOccurrenceDate(task: TaskCalendarInput): Date | null {
  const raw = task.startAt ?? task.dueAt ?? task.reminderAt
  if (!raw) return null
  const d = typeof raw === 'string' ? new Date(raw) : raw
  return Number.isNaN(d.getTime()) ? null : d
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

export function countTasksOnDay(tasks: TaskCalendarInput[], day: Date): number {
  return tasks.filter((t) => {
    const d = getTaskOccurrenceDate(t)
    return d && isSameCalendarDay(d, day)
  }).length
}

export function buildCalendarMonthDays(
  viewDate: Date,
  selectedDate: Date,
  tasks: TaskCalendarInput[],
): CalendarDayCell[] {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7
  const today = new Date()
  const days: CalendarDayCell[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    days.push(makeCell(new Date(year, month, -i), false))
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(makeCell(new Date(year, month, d), true))
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push(makeCell(new Date(year, month + 1, i), false))
  }
  return days

  function makeCell(date: Date, isCurrentMonth: boolean): CalendarDayCell {
    return {
      date,
      isCurrentMonth,
      isToday: isSameCalendarDay(date, today),
      isSelected: isSameCalendarDay(date, selectedDate),
      taskCount: countTasksOnDay(tasks, date),
    }
  }
}

export function filterTasksForDay<T extends TaskCalendarInput>(
  tasks: T[],
  day: Date,
): T[] {
  return tasks.filter((t) => {
    const d = getTaskOccurrenceDate(t)
    return d && isSameCalendarDay(d, day)
  })
}

export function formatTaskTimeRange(
  startAt: string | Date | null | undefined,
  endAt: string | Date | null | undefined,
  dueAt?: string | Date | null | undefined,
): string | null {
  const start = startAt ? new Date(startAt) : null
  const end = endAt ? new Date(endAt) : null
  const timeFmt = (d: Date) =>
    d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })

  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    return `${timeFmt(start)} – ${timeFmt(end)}`
  }
  if (dueAt) {
    const d = new Date(dueAt)
    if (!Number.isNaN(d.getTime())) return timeFmt(d)
  }
  return null
}

/** `YYYY-MM-DD` in local timezone — format used by react-native-calendars. */
export function toCalendarDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toCalendarMonthKey(date: Date): string {
  return toCalendarDateKey(new Date(date.getFullYear(), date.getMonth(), 1))
}

export interface CalendarMarkedDate {
  marked?: boolean
  selected?: boolean
  dotColor?: string
  selectedColor?: string
  selectedDotColor?: string
}

export type TaskMarkedDates = Record<string, CalendarMarkedDate>

export function buildTaskMarkedDates(
  tasks: TaskCalendarInput[],
  selectedDate: Date,
  options?: {
    dotColor?: string
    selectedColor?: string
    selectedDotColor?: string
  },
): TaskMarkedDates {
  const dotColor = options?.dotColor ?? '#3525cd'
  const selectedColor = options?.selectedColor ?? '#3525cd'
  const selectedDotColor = options?.selectedDotColor ?? '#ffffff'
  const marked: TaskMarkedDates = {}

  for (const task of tasks) {
    const d = getTaskOccurrenceDate(task)
    if (!d) continue
    const key = toCalendarDateKey(d)
    marked[key] = { ...marked[key], marked: true, dotColor }
  }

  const selectedKey = toCalendarDateKey(selectedDate)
  marked[selectedKey] = {
    ...marked[selectedKey],
    selected: true,
    selectedColor,
    selectedDotColor,
    marked: true,
    dotColor: marked[selectedKey]?.dotColor ?? dotColor,
  }

  return marked
}

export function dateFromCalendarKey(key: string): Date {
  const parts = key.split('-').map((part) => Number(part))
  const y = parts[0] ?? 1970
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  return new Date(y, m - 1, d)
}
