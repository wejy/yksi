'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  TopAppBar,
  BottomNav,
  CalendarGrid,
  TaskCard,
} from '@yksi/ui'

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  startAt: string | null
  endAt: string | null
  dueAt: string | null
}

// Based on ui/kalenteri/code.html
export default function CalendarPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewDate, setViewDate] = useState(new Date())

  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks ?? []))
      .catch(console.error)
  }, [])

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = (firstDay.getDay() + 6) % 7
    const days = []

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push(makeDay(d, false, tasks, selectedDate))
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      days.push(makeDay(date, true, tasks, selectedDate))
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push(makeDay(d, false, tasks, selectedDate))
    }
    return days
  }, [viewDate, tasks, selectedDate])

  const dayTasks = tasks.filter((t) => {
    const date = t.startAt ?? t.dueAt
    if (!date) return false
    const d = new Date(date)
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    )
  })

  const monthName = viewDate.toLocaleDateString('fi-FI', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-20 pt-16">
      <TopAppBar onNotifications={() => {}} />

      <main className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold capitalize text-on-surface">{monthName}</h2>
            <p className="text-sm text-on-surface-variant">
              {dayTasks.length} tehtävää valittuna päivänä
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() =>
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <CalendarGrid
          days={calendarDays}
          onDayClick={(date) => setSelectedDate(date)}
        />

        <section>
          <h3 className="mb-3 font-semibold text-on-surface">
            {selectedDate.toLocaleDateString('fi-FI', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>
          <div className="space-y-3">
            {dayTasks.map((task, i) => {
              const start = task.startAt ? new Date(task.startAt) : null
              const end = task.endAt ? new Date(task.endAt) : null
              const timeRange =
                start && end
                  ? `${start.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`
                  : undefined
              const accents = ['primary', 'tertiary', 'secondary'] as const
              return (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  status={task.status}
                  timeRange={timeRange}
                  accentColor={accents[i % accents.length]}
                  onClick={(id) => router.push(`/task/${id}`)}
                />
              )
            })}
          </div>
        </section>
      </main>

      <BottomNav
        activeTab="calendar"
        onTabChange={(tab) => {
          const routes: Record<string, string> = {
            dashboard: '/',
            tasks: '/tasks',
            calendar: '/calendar',
            profile: '/profile',
          }
          router.push(routes[tab] ?? '/')
        }}
      />
    </div>
  )
}

function makeDay(
  date: Date,
  isCurrentMonth: boolean,
  tasks: Task[],
  selected: Date,
) {
  const today = new Date()
  const taskCount = tasks.filter((t) => {
    const d = new Date(t.startAt ?? t.dueAt ?? '')
    return (
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    )
  }).length

  return {
    date,
    isCurrentMonth,
    isToday:
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear(),
    isSelected:
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear(),
    taskCount,
  }
}
