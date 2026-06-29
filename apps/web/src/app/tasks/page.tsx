'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TopAppBar,
  BottomNav,
  TaskCard,
  SearchBar,
  CategoryChip,
  Fab,
} from '@yksi/ui'

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  dueAt: string | null
  source: string
  yhteispinta: { name: string } | null
}

// Based on ui/teht_v_lista/code.html
export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('Kaikki')
  const filters = ['Kaikki', 'Työ', 'Koti', 'Projektit']

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    fetch(`/api/tasks?${params}`)
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks ?? []))
      .catch(console.error)
  }, [search])

  const filtered =
    activeFilter === 'Kaikki'
      ? tasks
      : tasks.filter((t) => t.yhteispinta?.name === activeFilter)

  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-20 pt-16">
      <TopAppBar onNotifications={() => {}} />

      <main className="space-y-4 p-4">
        <SearchBar value={search} onChange={setSearch} onFilter={() => {}} />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <CategoryChip
              key={f}
              label={f}
              active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            />
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              status={task.status}
              dueAt={task.dueAt ? new Date(task.dueAt) : null}
              yhteispintaName={task.yhteispinta?.name}
              onClick={(id) => router.push(`/task/${id}`)}
              onToggle={async (id) => {
                const newStatus = task.status === 'done' ? 'open' : 'done'
                await fetch(`/api/tasks/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus }),
                })
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === id ? { ...t, status: newStatus } : t,
                  ),
                )
              }}
            />
          ))}
        </div>
      </main>

      <Fab onClick={() => router.push('/tasks/new')} />

      <BottomNav
        activeTab="tasks"
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
