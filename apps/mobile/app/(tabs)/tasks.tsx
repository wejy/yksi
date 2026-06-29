import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import {
  TASKS_LIST_PAGE_SIZE,
  INTRESSI_LABEL,
  DEFAULT_TASK_SORT_BY,
  DEFAULT_TASK_SORT_ORDER,
  getTaskSourceMeta,
  type LinearTaskSourceDetail,
  type TaskSource,
  type TaskSortBy,
  type TaskSortOrder,
} from '@yksi/core'
import { useTabScrollBottomPadding } from '@/lib/layout'
import { TaskSearchBar } from '@/components/task-search-bar'
import { IntressiFilter, type IntressiFilterOption } from '@/components/intressi-filter'
import {
  TaskListControls,
  type TaskSortState,
  type TaskSourceFilterOption,
} from '@/components/task-list-controls'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueAt: string | null
  source: TaskSource
  labels: string[]
  sourceDetail: LinearTaskSourceDetail | null
  yhteispinta: { name: string } | null
}

// Based on ui/teht_v_lista/code.html
export default function TasksScreen() {
  const router = useRouter()
  const scrollBottomPadding = useTabScrollBottomPadding()
  const [tasks, setTasks] = useState<Task[]>([])
  const [intressit, setIntressit] = useState<IntressiFilterOption[]>([])
  const [availableSources, setAvailableSources] = useState<TaskSourceFilterOption[]>([])
  const [activeIntressiIds, setActiveIntressiIds] = useState<string[]>([])
  const [activeSources, setActiveSources] = useState<TaskSource[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TaskSortState>({
    sortBy: DEFAULT_TASK_SORT_BY,
    sortOrder: DEFAULT_TASK_SORT_ORDER,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    apiFetch<{ intressit: IntressiFilterOption[] }>('/api/yhteispinnat?usedInTasks=true')
      .then((data) =>
        setIntressit(
          (data.intressit ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            taskCount: item.taskCount ?? 0,
          })),
        ),
      )
      .catch(console.error)

    apiFetch<{ sources: TaskSourceFilterOption[] }>('/api/tasks/sources')
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
        loadingMoreRef.current = true
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

        const data = await apiFetch<{ tasks: Task[]; total: number }>(`/api/tasks?${params}`)
        const page = data.tasks ?? []
        const count = data.total ?? 0

        setTotal(count)
        setTasks((prev) => (append ? [...prev, ...page] : page))
        setHasMore(offset + page.length < count)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
        setLoadingMore(false)
        loadingMoreRef.current = false
      }
    },
    [],
  )

  useEffect(() => {
    fetchPage(0, search, activeIntressiIds, activeSources, sort.sortBy, sort.sortOrder, false)
  }, [search, activeIntressiIds, activeSources, sort.sortBy, sort.sortOrder, fetchPage])

  const loadMore = useCallback(() => {
    if (loading || loadingMoreRef.current || !hasMore) return
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
    hasMore,
    tasks.length,
    search,
    activeIntressiIds,
    activeSources,
    sort.sortBy,
    sort.sortOrder,
    fetchPage,
  ])

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 120
    if (nearBottom) loadMore()
  }

  const intressiSummary =
    activeIntressiIds.length === 0
      ? null
      : activeIntressiIds.length === 1
        ? intressit.find((i) => i.id === activeIntressiIds[0])?.name ?? null
        : `${activeIntressiIds.length} intressiä`
  const sourcesFiltered = activeSources.length > 0
  const intressiFiltered = activeIntressiIds.length > 0

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-14">
        <Text className="text-2xl font-bold text-on-surface">Tehtävät</Text>
        <Text className="mt-1 text-sm text-on-surface-variant">
          {search
            ? `${total} hakutulosta`
            : intressiSummary
              ? `${total} intressissä «${intressiSummary}» · ${tasks.length}/${total} ladattu`
              : `${tasks.length}/${total} ladattu`}
        </Text>
        <Pressable
          onPress={() => router.push('/tasks/new')}
          className="mt-2 flex-row items-center gap-1 self-start"
        >
          <Text className="text-lg font-semibold leading-none text-primary">+</Text>
          <Text className="text-sm font-semibold text-primary">Lisää tehtävä</Text>
        </Pressable>
        <View className="mt-3">
          <TaskSearchBar value={search} onChangeText={setSearch} />
        </View>
        <View className="mt-3">
          <IntressiFilter
            intressit={intressit}
            activeIds={activeIntressiIds}
            onActiveIdsChange={setActiveIntressiIds}
          />
        </View>
        <View className="mt-3">
          <TaskListControls
            sort={sort}
            onSortChange={setSort}
            availableSources={availableSources}
            activeSources={activeSources}
            onActiveSourcesChange={setActiveSources}
          />
        </View>
      </View>

      {loading && tasks.length === 0 ? (
        <ActivityIndicator className="mt-8" color="#3525cd" />
      ) : (
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
          onScroll={handleScroll}
          scrollEventThrottle={200}
        >
          {tasks.length === 0 ? (
            <Text className="py-12 text-center text-on-surface-variant">
              {search
                ? 'Ei hakutuloksia'
                : intressiFiltered
                  ? 'Ei tehtäviä valituissa intresseissä'
                  : sourcesFiltered
                    ? 'Ei tehtäviä valituista lähteistä'
                    : 'Ei tehtäviä'}
            </Text>
          ) : (
            tasks.map((task) => {
              const sourceMeta = getTaskSourceMeta(task.source)
              const intressiName = task.yhteispinta?.name ?? task.sourceDetail?.projectName
              const visibleLabels = task.labels?.slice(0, 3) ?? []
              const extraLabels = (task.labels?.length ?? 0) - visibleLabels.length

              return (
                <Pressable
                  key={task.id}
                  onPress={() => router.push(`/task/${task.id}`)}
                  className="mb-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <View className="mb-1 flex-row flex-wrap items-center gap-2">
                    <View className="rounded-full bg-surface-container px-2 py-0.5">
                      <Text className="text-[11px] font-semibold uppercase text-on-surface-variant">
                        {sourceMeta.label}
                      </Text>
                    </View>
                    {task.sourceDetail?.stateName ? (
                      <View className="rounded-full bg-surface-container px-2 py-0.5">
                        <Text className="text-[11px] text-on-surface-variant">
                          {task.sourceDetail.stateName}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View className="flex-row items-start justify-between">
                    <Text
                      className={`flex-1 font-semibold text-on-surface ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
                    >
                      {task.title}
                    </Text>
                    {task.priority !== 'none' && (
                      <View className="ml-2 rounded-full bg-error/10 px-2 py-0.5">
                        <Text className="text-xs font-medium text-error">
                          {task.priority === 'high' || task.priority === 'urgent' ? 'Korkea' : 'Normaali'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {task.description ? (
                    <Text className="mt-1 text-sm text-on-surface-variant" numberOfLines={2}>
                      {task.description}
                    </Text>
                  ) : null}

                  {visibleLabels.length > 0 ? (
                    <View className="mt-2 flex-row flex-wrap gap-1.5">
                      {visibleLabels.map((label) => (
                        <View key={label} className="rounded-full bg-primary/10 px-2 py-0.5">
                          <Text className="text-[11px] font-medium text-primary">{label}</Text>
                        </View>
                      ))}
                      {extraLabels > 0 ? (
                        <View className="rounded-full bg-surface-container px-2 py-0.5">
                          <Text className="text-[11px] text-on-surface-variant">+{extraLabels}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  <View className="mt-2 flex-row flex-wrap gap-3">
                    {task.dueAt ? (
                      <Text className="text-xs text-on-surface-variant">
                        {new Date(task.dueAt).toLocaleDateString('fi-FI')}
                      </Text>
                    ) : null}
                    {intressiName ? (
                      <Text className="text-xs font-medium text-on-surface">
                        {INTRESSI_LABEL}: {intressiName}
                      </Text>
                    ) : null}
                    {task.sourceDetail?.teamName && !intressiName ? (
                      <Text className="text-xs text-on-surface-variant">{task.sourceDetail.teamName}</Text>
                    ) : null}
                  </View>
                </Pressable>
              )
            })
          )}

          {loadingMore ? (
            <ActivityIndicator className="py-4" color="#3525cd" />
          ) : hasMore ? (
            <Text className="py-4 text-center text-xs text-on-surface-variant">
              Vieritä alas ladataksesi lisää
            </Text>
          ) : tasks.length > 0 && tasks.length >= total ? (
            <Text className="py-4 text-center text-xs text-on-surface-variant">
              Kaikki tehtävät ladattu
            </Text>
          ) : null}
        </ScrollView>
      )}

    </View>
  )
}
