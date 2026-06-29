'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  TopAppBar,
  TaskMonthCalendar,
  TaskCard,
  bottomNavPaddingClass,
} from '@yksi/ui'
import { LocalizedBottomNav } from '@/components/localized-bottom-nav'
import {
  filterTasksForDay,
  formatTaskTimeRange,
  isSameCalendarDay,
  type TaskSource,
} from '@yksi/core'

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  source: TaskSource
  startAt: string | null
  endAt: string | null
  dueAt: string | null
  reminderAt: string | null
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

  const dayTasks = useMemo(
    () => filterTasksForDay(tasks, selectedDate),
    [tasks, selectedDate],
  )

  const todayTaskCount = useMemo(
    () => filterTasksForDay(tasks, new Date()).length,
    [tasks],
  )

  const monthName = viewDate.toLocaleDateString('fi-FI', {
    month: 'long',
    year: 'numeric',
  })

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    if (
      date.getMonth() !== viewDate.getMonth() ||
      date.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }

  return (
    <div className={`mx-auto min-h-screen max-w-2xl pt-16 ${bottomNavPaddingClass}`}>
      <TopAppBar onNotifications={() => {}} />

      <main className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold capitalize text-on-surface">{monthName}</h2>
            <p className="text-sm text-on-surface-variant">
              {isSameCalendarDay(selectedDate, new Date())
                ? `${todayTaskCount} tehtävää tänään`
                : `${dayTasks.length} tehtävää valittuna päivänä`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
              }
              className="rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container-low"
              aria-label="Edellinen kuukausi"
            >
              <span className="material-symbols-outlined text-on-surface">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
              }
              className="rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container-low"
              aria-label="Seuraava kuukausi"
            >
              <span className="material-symbols-outlined text-on-surface">chevron_right</span>
            </button>
          </div>
        </div>

        <TaskMonthCalendar
          viewDate={viewDate}
          selectedDate={selectedDate}
          tasks={tasks}
          onSelectDate={handleSelectDate}
          onMonthChange={setViewDate}
        />

        <section>
          <h3 className="mb-3 font-semibold capitalize text-on-surface">
            {selectedDate.toLocaleDateString('fi-FI', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>
          {dayTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              Ei tehtäviä tälle päivälle
            </p>
          ) : (
            <div className="space-y-3">
              {dayTasks.map((task, i) => {
                const timeRange =
                  formatTaskTimeRange(task.startAt, task.endAt, task.dueAt) ?? undefined
                const accents = ['primary', 'tertiary', 'secondary'] as const
                return (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    priority={task.priority}
                    status={task.status}
                    source={task.source}
                    timeRange={timeRange}
                    accentColor={accents[i % accents.length]}
                    onClick={(id) => router.push(`/task/${id}`)}
                  />
                )
              })}
            </div>
          )}
        </section>
      </main>

      <LocalizedBottomNav activeTab="calendar" />
    </div>
  )
}
