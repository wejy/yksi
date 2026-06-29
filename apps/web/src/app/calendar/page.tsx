'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  TopAppBar,
  TaskMonthCalendar,
  TaskWeekCalendar,
  TaskDayStrip,
  CalendarViewToggle,
  TaskCard,
  bottomNavPaddingClass,
} from '@yksi/ui'
import { LocalizedBottomNav } from '@/components/localized-bottom-nav'
import {
  DEFAULT_CALENDAR_VIEW_MODE,
  filterTasksForDay,
  formatCalendarPeriodLabel,
  formatTaskTimeRange,
  isSameCalendarDay,
  navigateCalendarPeriod,
  type CalendarViewMode,
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
  const [viewMode, setViewMode] = useState<CalendarViewMode>(DEFAULT_CALENDAR_VIEW_MODE)

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

  const periodLabel = formatCalendarPeriodLabel(viewMode, selectedDate, viewDate)
  const subtitle =
    viewMode === 'day'
      ? isSameCalendarDay(selectedDate, new Date())
        ? `${dayTasks.length} tehtävää tänään`
        : `${dayTasks.length} tehtävää`
      : viewMode === 'week'
        ? `${dayTasks.length} tehtävää valitulla päivällä`
        : isSameCalendarDay(selectedDate, new Date())
          ? `${dayTasks.length} tehtävää tänään (valittu päivä)`
          : `${dayTasks.length} tehtävää valittuna päivänä`

  function goToPrevious() {
    if (viewMode === 'day') {
      const next = navigateCalendarPeriod('day', selectedDate, -1)
      setSelectedDate(next)
      setViewDate(next)
      return
    }
    setViewDate((current) => navigateCalendarPeriod(viewMode, current, -1))
  }

  function goToNext() {
    if (viewMode === 'day') {
      const next = navigateCalendarPeriod('day', selectedDate, 1)
      setSelectedDate(next)
      setViewDate(next)
      return
    }
    setViewDate((current) => navigateCalendarPeriod(viewMode, current, 1))
  }

  function handleViewModeChange(mode: CalendarViewMode) {
    setViewMode(mode)
    if (mode === 'month') {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    } else {
      setViewDate(selectedDate)
    }
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    if (viewMode === 'month') {
      if (
        date.getMonth() !== viewDate.getMonth() ||
        date.getFullYear() !== viewDate.getFullYear()
      ) {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
      }
    } else if (viewMode === 'day') {
      setViewDate(date)
    }
  }

  const navLabel =
    viewMode === 'day' ? 'päivä' : viewMode === 'week' ? 'viikko' : 'kuukausi'

  return (
    <div className={`mx-auto min-h-screen max-w-2xl pt-16 ${bottomNavPaddingClass}`}>
      <TopAppBar onNotifications={() => {}} />

      <main className="space-y-6 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold capitalize text-on-surface">{periodLabel}</h2>
              <p className="text-sm text-on-surface-variant">{subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goToPrevious}
                className="rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container-low"
                aria-label={`Edellinen ${navLabel}`}
              >
                <span className="material-symbols-outlined text-on-surface">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container-low"
                aria-label={`Seuraava ${navLabel}`}
              >
                <span className="material-symbols-outlined text-on-surface">chevron_right</span>
              </button>
            </div>
          </div>

          <CalendarViewToggle value={viewMode} onChange={handleViewModeChange} />
        </div>

        {viewMode === 'day' ? (
          <TaskDayStrip
            selectedDate={selectedDate}
            tasks={tasks}
            onSelectDate={handleSelectDate}
          />
        ) : null}

        {viewMode === 'month' ? (
          <TaskMonthCalendar
            viewDate={viewDate}
            selectedDate={selectedDate}
            tasks={tasks}
            onSelectDate={handleSelectDate}
            onMonthChange={setViewDate}
          />
        ) : null}

        {viewMode === 'week' ? (
          <TaskWeekCalendar
            viewDate={viewDate}
            selectedDate={selectedDate}
            tasks={tasks}
            onSelectDate={handleSelectDate}
            onTaskClick={(task) => router.push(`/task/${task.id}`)}
          />
        ) : null}

        {viewMode === 'day' || viewMode === 'month' ? (
          <section>
            {viewMode === 'month' ? (
              <h3 className="mb-3 font-semibold capitalize text-on-surface">
                {selectedDate.toLocaleDateString('fi-FI', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
            ) : null}
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
        ) : null}
      </main>

      <LocalizedBottomNav activeTab="calendar" />
    </div>
  )
}
