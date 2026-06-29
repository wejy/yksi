import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import {
  DEFAULT_TASK_SORT_BY,
  DEFAULT_TASK_SORT_ORDER,
  TASK_SORT_BY_OPTIONS,
  TASK_SORT_ORDER_OPTIONS,
  type TaskSortBy,
  type TaskSortOrder,
} from '@yksi/core'

export interface TaskSortState {
  sortBy: TaskSortBy
  sortOrder: TaskSortOrder
}

interface TaskListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: TaskSortState
  onSortChange: (sort: TaskSortState) => void
  placeholder?: string
}

export function TaskListToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  placeholder = 'Etsi tehtäviä...',
}: TaskListToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false)

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="min-h-11 flex-1 flex-row items-center rounded-xl border border-outline-variant bg-surface-container-low px-3">
          <Text className="mr-2 text-base text-on-surface-variant">⌕</Text>
          <TextInput
            className="flex-1 py-2.5 text-sm text-on-surface"
            placeholder={placeholder}
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={onSearchChange}
          />
        </View>
        <Pressable
          onPress={() => setSortOpen((open) => !open)}
          className={`h-11 w-11 items-center justify-center rounded-xl border border-outline-variant ${sortOpen ? 'bg-surface-container' : 'bg-surface-container-low'}`}
          accessibilityLabel="Järjestä tehtävät"
        >
          <Text className="text-lg text-on-surface-variant">⇅</Text>
        </Pressable>
      </View>

      {sortOpen ? (
        <View className="mt-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
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
