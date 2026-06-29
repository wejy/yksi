import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import {
  TASK_SORT_BY_OPTIONS,
  TASK_SORT_ORDER_OPTIONS,
  formatFilterCountLabel,
  type TaskSortBy,
  type TaskSortOrder,
  type TaskSource,
} from '@yksi/core'

export interface TaskSortState {
  sortBy: TaskSortBy
  sortOrder: TaskSortOrder
}

export interface TaskSourceFilterOption {
  source: TaskSource
  label: string
  icon: string
  taskCount: number
  connected: boolean
}

interface TaskListControlsProps {
  sort: TaskSortState
  onSortChange: (sort: TaskSortState) => void
  availableSources: TaskSourceFilterOption[]
  activeSources: TaskSource[]
  onActiveSourcesChange: (sources: TaskSource[]) => void
}

function ToolbarChip({
  label,
  active,
  onPress,
}: {
  label: string
  active?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${active ? 'border-primary/40 bg-primary/10' : 'border-outline-variant bg-surface-container-low'}`}
    >
      <Text className={`text-sm font-medium ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
        {label}
      </Text>
    </Pressable>
  )
}

export function TaskListControls({
  sort,
  onSortChange,
  availableSources,
  activeSources,
  onActiveSourcesChange,
}: TaskListControlsProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const sourcesFiltered = activeSources.length > 0
  const sourceButtonLabel =
    activeSources.length === 1
      ? (() => {
          const option = availableSources.find((s) => s.source === activeSources[0])
          return option ? formatFilterCountLabel(option.label, option.taskCount) : 'Lähde'
        })()
      : activeSources.length > 1
        ? `${activeSources.length} lähdettä`
        : 'Lähde'

  function toggleSource(source: TaskSource) {
    if (activeSources.includes(source)) {
      onActiveSourcesChange(activeSources.filter((s) => s !== source))
    } else {
      onActiveSourcesChange([...activeSources, source])
    }
  }

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {availableSources.length > 0 ? (
          <ToolbarChip
            label={sourceButtonLabel}
            active={sourcesFiltered || filterOpen}
            onPress={() => {
              setSortOpen(false)
              setFilterOpen((open) => !open)
            }}
          />
        ) : null}
        <ToolbarChip
          label="Järjestä"
          active={sortOpen}
          onPress={() => {
            setFilterOpen(false)
            setSortOpen((open) => !open)
          }}
        />
      </View>

      {filterOpen && availableSources.length > 0 ? (
        <View className="mt-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <Text className="mb-3 text-sm font-semibold text-on-surface">Lähteet</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              onPress={() => onActiveSourcesChange([])}
              className={`mr-2 rounded-full px-4 py-2 ${!sourcesFiltered ? 'bg-primary' : 'bg-surface-container'}`}
            >
              <Text
                className={`text-sm ${!sourcesFiltered ? 'font-medium text-on-primary' : 'text-on-surface-variant'}`}
              >
                Kaikki
              </Text>
            </Pressable>
            {availableSources.map((option) => {
              const selected = activeSources.includes(option.source)
              return (
                <Pressable
                  key={option.source}
                  onPress={() => toggleSource(option.source)}
                  className={`mr-2 rounded-full px-4 py-2 ${selected ? 'bg-primary' : 'bg-surface-container'}`}
                >
                  <Text
                    className={`text-sm tabular-nums ${selected ? 'font-medium text-on-primary' : 'text-on-surface-variant'}`}
                  >
                    {formatFilterCountLabel(option.label, option.taskCount)}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      ) : null}

      {sortOpen ? (
        <View className="mt-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <Text className="mb-3 text-sm font-semibold text-on-surface">Järjestä</Text>

          <Text className="mb-1 text-xs font-medium text-on-surface-variant">Järjestys</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {TASK_SORT_BY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => onSortChange({ ...sort, sortBy: option.value })}
                className={`mr-2 rounded-full px-4 py-2 ${sort.sortBy === option.value ? 'bg-primary' : 'bg-surface-container'}`}
              >
                <Text
                  className={`text-sm ${sort.sortBy === option.value ? 'font-medium text-on-primary' : 'text-on-surface-variant'}`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="mb-1 text-xs font-medium text-on-surface-variant">Suunta</Text>
          <View className="flex-row gap-2">
            {TASK_SORT_ORDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => onSortChange({ ...sort, sortOrder: option.value })}
                className={`rounded-full px-4 py-2 ${sort.sortOrder === option.value ? 'bg-primary' : 'bg-surface-container'}`}
              >
                <Text
                  className={`text-sm ${sort.sortOrder === option.value ? 'font-medium text-on-primary' : 'text-on-surface-variant'}`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}
