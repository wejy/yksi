'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TopAppBar,
  TaskCard,
  SearchBar,
  AddTaskButton,
  TaskListControls,
  IntressiFilter,
  bottomNavPaddingClass,
  type TaskSortState,
  type TaskSourceFilterOption,
  type IntressiFilterOption,
} from '@yksi/ui'
import { LocalizedBottomNav } from '@/components/localized-bottom-nav'
import { useI18n } from '@yksi/i18n/react'
import {
  TASKS_LIST_PAGE_SIZE,
  DEFAULT_TASK_SORT_BY,
  DEFAULT_TASK_SORT_ORDER,
  type LinearTaskSourceDetail,
  type TaskSource,
  type TaskSortBy,
  type TaskSortOrder,
} from '@yksi/core'

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
  yhteispinta: { id: string; name: string; color: string | null; icon: string | null } | null
}

function intressiFilterSummary(
  intressit: IntressiFilterOption[],
  activeIds: string[],
  t: (key: string, params?: Record<string, string | number>) => string,
): string | null {
  if (activeIds.length === 0) return null
  if (activeIds.length === 1) {
    return intressit.find((i) => i.id === activeIds[0])?.name ?? null
  }
  return t('tasks.intressiCount', { count: activeIds.length })
}

// Based on ui/teht_v_lista/code.html
export default function TasksPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [tasks, setTasks] = useState<Task[]>([])
  const [intressit, setIntressit] = useState<IntressiFilterOption[]>([])
  const [availableSources, setAvailableSources] = useState<TaskSourceFilterOption[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TaskSortState>({
    sortBy: DEFAULT_TASK_SORT_BY,
    sortOrder: DEFAULT_TASK_SORT_ORDER,
  })
  const [activeSources, setActiveSources] = useState<TaskSource[]>([])
  const [activeIntressiIds, setActiveIntressiIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/yhteispinnat?usedInTasks=true')
      .then((r) => r.json())
      .then((data) =>
        setIntressit(
          (data.intressit ?? []).map(
            (item: {
              id: string
              name: string
              taskCount: number
              color: string | null
              icon: string | null
            }) => ({
              id: item.id,
              name: item.name,
              taskCount: item.taskCount ?? 0,
              color: item.color,
              icon: item.icon,
            }),
          ),
        ),
      )
      .catch(console.error)

    fetch('/api/tasks/sources')
      .then((r) => r.json())
      .then((data) => setAvailableSources(data.sources ?? []))
      .catch(console.error)
  }, [])

  const fetchPage = useCallback(
    async (
      offset: number,
      searchQuery: string,
      intressiIds: string[],
      sources: TaskSource[],
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
        if (intressiIds.length > 0) params.set('yhteispintaIds', intressiIds.join(','))
        if (sources.length > 0) params.set('sources', sources.join(','))
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
    fetchPage(0, search, activeIntressiIds, activeSources, sort.sortBy, sort.sortOrder, false)
  }, [search, activeIntressiIds, activeSources, sort.sortBy, sort.sortOrder, fetchPage])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    fetchPage(
      tasks.length,
      search,
      activeIntressiIds,
      activeSources,
      sort.sortBy,
      sort.sortOrder,
      true,
    )
  }, [
    loading,
    loadingMore,
    hasMore,
    tasks.length,
    search,
    activeIntressiIds,
    activeSources,
    sort.sortBy,
    sort.sortOrder,
    fetchPage,
  ])

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
  const intressiSummary = intressiFilterSummary(intressit, activeIntressiIds, t)
  const sourcesFiltered = activeSources.length > 0
  const intressiFiltered = activeIntressiIds.length > 0

  return (
    <div className={`mx-auto min-h-screen max-w-2xl pt-16 ${bottomNavPaddingClass}`}>
      <TopAppBar onNotifications={() => {}} />

      <main className="space-y-4 p-4">
        <div className="px-1">
          <h2 className="text-2xl font-bold text-on-surface">{t('tasks.title')}</h2>
          <p className="text-sm text-on-surface-variant">
            {search
              ? t('tasks.searchResults', { count: total })
              : intressiSummary
                ? t('tasks.intressiLoaded', {
                    total,
                    name: intressiSummary,
                    loaded: loadedCount,
                  })
                : t('tasks.openLoaded', { open: openCount, loaded: loadedCount, total })}
          </p>
          <AddTaskButton
            onClick={() => router.push('/tasks/new')}
            className="mt-2"
            label={t('tasks.addTask')}
          />
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder={t('tasks.searchPlaceholder')} />

        <IntressiFilter
          intressit={intressit}
          activeIds={activeIntressiIds}
          onActiveIdsChange={setActiveIntressiIds}
        />

        <TaskListControls
          sort={sort}
          onSortChange={setSort}
          availableSources={availableSources}
          activeSources={activeSources}
          onActiveSourcesChange={setActiveSources}
        />

        <div className="space-y-3">
          {loading && tasks.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-12 text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-outline">inbox</span>
              <p className="font-medium text-on-surface">
                {search
                  ? t('tasks.noResults')
                  : intressiFiltered
                    ? t('tasks.noTasksIntressi')
                    : sourcesFiltered
                      ? t('tasks.noTasksSource')
                      : t('tasks.noTasks')}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {search ? t('tasks.tryAnotherSearch') : t('tasks.syncOrCreate')}
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
                  intressi={
                    task.yhteispinta
                      ? {
                          name: task.yhteispinta.name,
                          color: task.yhteispinta.color,
                          icon: task.yhteispinta.icon,
                        }
                      : null
                  }
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
                  <p className="text-xs text-on-surface-variant">{t('tasks.scrollForMore')}</p>
                ) : loadedCount > 0 && loadedCount >= total ? (
                  <p className="text-xs text-on-surface-variant">{t('tasks.allLoaded')}</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </main>

      <LocalizedBottomNav activeTab="tasks" />
    </div>
  )
}
