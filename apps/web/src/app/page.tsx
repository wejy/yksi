'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav, ProgressRing, Button } from '@yksi/ui'

interface TodayTask {
  id: string
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  dueAt: string | null
  startAt: string | null
}

// Based on ui/dashboard_korjattu/code.html
export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [summary, setSummary] = useState({ total: 0, completed: 0, remaining: 0 })
  const [pendingCount, setPendingCount] = useState(0)
  const [userInitial, setUserInitial] = useState('')

  useEffect(() => {
    fetch('/api/tasks/today')
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks ?? [])
        setSummary(data.summary ?? { total: 0, completed: 0, remaining: 0 })
      })
      .catch(console.error)

    fetch('/api/tasks?status=open')
      .then((r) => r.json())
      .then((data) => setPendingCount(data.total ?? 0))
      .catch(console.error)

    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => setUserInitial((data.name ?? data.email ?? 'Y')[0]?.toUpperCase()))
      .catch(console.error)
  }, [])

  const picks = tasks.slice(0, 5)
  const percent =
    summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0

  function formatTaskMeta(task: TodayTask): string {
    if (task.status === 'done') return 'Valmis'
    if (task.startAt) {
      return `Alkaa klo ${new Date(task.startAt).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`
    }
    if (task.dueAt) {
      return `Deadline: ${new Date(task.dueAt).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`
    }
    return 'Tänään'
  }

  function taskIcon(task: TodayTask): string {
    if (task.status === 'done') return 'check_circle'
    if (task.startAt) return 'groups'
    return 'description'
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-20">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary">
            Y
          </div>
          <h1 className="text-xl font-semibold text-on-surface">Yksi</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-surface-container"
            aria-label="Ilmoitukset"
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-on-primary-container">
            {userInitial}
          </div>
        </div>
      </header>

      <main className="space-y-6 overflow-y-auto px-6 pb-6 pt-6">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
                Tämän päivän edistyminen
              </h2>
              <p className="text-xl font-semibold text-on-surface">
                {summary.completed}/{summary.total} tehtävää valmiina
              </p>
            </div>
            <div className="relative">
              <ProgressRing completed={summary.completed} total={summary.total || 1} size={64} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold">
                {percent}%
              </div>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant">
            {percent >= 80
              ? 'Hienoa työtä! Olet lähes tavoitteessasi.'
              : 'Jatka eteenpäin — pienet askeleet vievät perille.'}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <span className="material-symbols-outlined text-2xl text-primary">pending_actions</span>
            <p className="text-xs text-on-surface-variant">Odottavat tehtävät</p>
            <p className="text-2xl font-semibold text-on-surface">{pendingCount}</p>
          </div>
          <div className="space-y-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <span className="material-symbols-outlined text-2xl text-primary">timer</span>
            <p className="text-xs text-on-surface-variant">Tehtäviä tänään</p>
            <p className="text-2xl font-semibold text-on-surface">{summary.total}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-on-surface">Päivän poiminnat</h2>
            <button
              type="button"
              onClick={() => router.push('/tasks')}
              className="text-sm font-semibold text-primary"
            >
              Näytä kaikki
            </button>
          </div>
          <div className="space-y-3">
            {picks.length === 0 ? (
              <p className="py-8 text-center text-sm text-on-surface-variant">
                Ei tehtäviä tänään. Hyvää työpäivää!
              </p>
            ) : (
              picks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => router.push(`/task/${task.id}`)}
                  className={`flex w-full items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-sm transition-colors hover:border-primary/30 ${task.status === 'done' ? 'opacity-75' : ''}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${task.status === 'done' ? 'bg-surface-container' : 'bg-primary-container/10'}`}
                  >
                    <span
                      className={`material-symbols-outlined ${task.status === 'done' ? 'text-on-surface-variant' : 'text-primary'}`}
                    >
                      {taskIcon(task)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-semibold text-on-surface ${task.status === 'done' ? 'line-through' : ''}`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant">{formatTaskMeta(task)}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </button>
              ))
            )}
          </div>
        </section>

        <Button
          className="w-full gap-2 py-4 shadow-lg shadow-primary/20"
          onClick={() => router.push('/tasks')}
        >
          <span className="material-symbols-outlined">add</span>
          Uusi tehtävä
        </Button>
      </main>

      <BottomNav
        activeTab="dashboard"
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
