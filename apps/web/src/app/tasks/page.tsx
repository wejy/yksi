'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TopAppBar,
  BottomNav,
  TaskCard,
  SearchBar,
  CategoryChip,
  Fab,
  bottomNavPaddingClass,
} from '@yksi/ui'
import {
  TASKS_LIST_PAGE_SIZE,
  DEFAULT_TASK_SORT_BY,
  DEFAULT_TASK_SORT_ORDER,
  type LinearTaskSourceDetail,
  type TaskSource,
  type TaskSortBy,
  type TaskSortOrder,
} from '@yksi/core'
import type { TaskSortState } from '@yksi/ui'

interface Intressi {
  id: string
  name: string
  color: string | null
  taskCount?: number
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  dueAt: string | null
  source: TaskSource
  labels: string[]
  sourceDetail: LinearTaskSourceDetail | null
  yhteispinta: { id: string; name: string; color: string | null } | null
}

// Based on ui/teht_v_lista/code.html
export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [intressit, setIntressit] = useState<Intressi[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TaskSortState>({
    sortBy: DEFAULT_TASK_SORT_BY,
    sortOrder: DEFAULT_TASK_SORT_ORDER,
  })
  const [activeIntressiId, setActiveIntressiId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/yhteispinnat?usedInTasks=true')
      .then((r) => r.json())
      .then((data) => setIntressit(data.intressit ?? []))
      .catch(console.error)
  }, [])

  const fetchPage = useCallback(
    async (
      offset: number,
      searchQuery: string,
      intressiId: string | null,
      sortBy: TaskSortBy,
      sortOrder: TaskSortOrder,
      append: boolean,
    ) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      try {
        const params = new URLSearchParams()
        params.set('limit', String(TASKS_LIST_PAGE_SIZE))
        params.set('offset', String(offset))
        if (searchQuery.trim()) params.set('search', searchQuery.trim())
        if (intressiId) params.set('yhteispintaId', intressiId)
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)

        const res = await fetch(`/api/tasks?${params}`)
        const data = await res.json()
        const page: Task[] = data.tasks ?? []
        const count: number = data.total ?? 0

        setTotal(count)
        setTasks((prev) => (append ? [...prev, ...page] : page))
        setHasMore(offset + page.length < count)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchPage(0, search, activeIntressiId, sort.sortBy, sort.sortOrder, false)
  }, [search, activeIntressiId, sort.sortBy, sort.sortOrder, fetchPage])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    fetchPage(tasks.length, search, activeIntressiId, sort.sortBy, sort.sortOrder, true)
  }, [loading, loadingMore, hasMore, tasks.length, search, activeIntressiId, sort.sortBy, sort.sortOrder, fetchPage])

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  const openCount = tasks.filter((t) => t.status !== 'done').length
  const loadedCount = tasks.length
  const activeIntressiName = intressit.find((i) => i.id === activeIntressiId)?.name

  return (
    <div className={`mx-auto min-h-screen max-w-2xl pt-16 ${bottomNavPaddingClass}`}>
      <TopAppBar onNotifications={() => {}} />

      <main className="space-y-4 p-4">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Tehtävät</h2>
            <p className="text-sm text-on-surface-variant">
              {search
                ? `${total} hakutulosta`
                : activeIntressiName
                  ? `${total} intressissä «${activeIntressiName}» · ${loadedCount}/${total} ladattu`
                  : `${openCount} avointa ladatussa · ${loadedCount}/${total} ladattu`}
            </p>
          </div>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />

        {intressit.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <CategoryChip
              label="Kaikki intressit"
              active={activeIntressiId === null}
              onClick={() => setActiveIntressiId(null)}
            />
            {intressit.map((intressi) => (
              <CategoryChip
                key={intressi.id}
                label={intressi.name}
                active={activeIntressiId === intressi.id}
                onClick={() => setActiveIntressiId(intressi.id)}
              />
            ))}
          </div>
        )}

        <div className="space-y-3">
          {loading && tasks.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-12 text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-outline">inbox</span>
              <p className="font-medium text-on-surface">
                {search ? 'Ei hakutuloksia' : activeIntressiId ? 'Ei tehtäviä tässä intressissä' : 'Ei tehtäviä'}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {search
                  ? 'Kokeile toista hakusanaa'
                  : 'Synkkaa Linear/Notion tai luo uusi tehtävä'}
              </p>
            </div>
          ) : (
            <>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  status={task.status}
                  source={task.source}
                  labels={task.labels}
                  sourceDetail={task.sourceDetail}
                  intressiName={task.yhteispinta?.name}
                  dueAt={task.dueAt ? new Date(task.dueAt) : null}
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

              <div ref={loadMoreRef} className="flex justify-center py-4">
                {loadingMore ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
                ) : hasMore ? (
                  <p className="text-xs text-on-surface-variant">Vieritä alas ladataksesi lisää</p>
                ) : loadedCount > 0 && loadedCount >= total ? (
                  <p className="text-xs text-on-surface-variant">Kaikki tehtävät ladattu</p>
                ) : null}
              </div>
            </>
          )}
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
