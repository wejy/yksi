import { useMemo, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import {
  INTRESSI_FILTER_CHIP_LIMIT,
  INTRESSI_LABEL,
  formatFilterCountLabel,
} from '@yksi/core'

export interface IntressiFilterOption {
  id: string
  name: string
  taskCount: number
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

function Chip({
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
      className={`mr-2 rounded-full px-4 py-1.5 ${active ? 'bg-primary' : 'bg-surface-container'}`}
    >
      <Text
        className={`text-sm font-medium tabular-nums ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export function IntressiFilter({
  intressit,
  activeIds,
  onActiveIdsChange,
  chipLimit = INTRESSI_FILTER_CHIP_LIMIT,
}: {
  intressit: IntressiFilterOption[]
  activeIds: string[]
  onActiveIdsChange: (ids: string[]) => void
  chipLimit?: number
}) {
  if (intressit.length === 0) return null

  if (intressit.length <= chipLimit) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          label="Kaikki intressit"
          active={activeIds.length === 0}
          onPress={() => onActiveIdsChange([])}
        />
        {intressit.map((intressi) => (
          <Chip
            key={intressi.id}
            label={formatFilterCountLabel(intressi.name, intressi.taskCount)}
            active={activeIds.includes(intressi.id)}
            onPress={() => onActiveIdsChange(toggleId(activeIds, intressi.id))}
          />
        ))}
      </ScrollView>
    )
  }

  return (
    <IntressiCombobox
      intressit={intressit}
      activeIds={activeIds}
      onActiveIdsChange={onActiveIdsChange}
    />
  )
}

function IntressiCombobox({
  intressit,
  activeIds,
  onActiveIdsChange,
}: {
  intressit: IntressiFilterOption[]
  activeIds: string[]
  onActiveIdsChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return intressit
    return intressit.filter((item) => item.name.toLowerCase().includes(q))
  }, [intressit, query])

  const selected = intressit.find((i) => i.id === activeIds[0])
  const summary =
    activeIds.length === 0
      ? 'Kaikki intressit'
      : activeIds.length === 1 && selected
        ? formatFilterCountLabel(selected.name, selected.taskCount)
        : `${activeIds.length} intressiä valittu`

  const selectedItems = intressit.filter((item) => activeIds.includes(item.id))

  return (
    <View>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        className={`h-12 flex-row items-center justify-between rounded-xl border px-4 ${
          open || activeIds.length > 0
            ? 'border-primary/40 bg-primary/5'
            : 'border-outline-variant bg-surface-container-low'
        }`}
      >
        <Text className="flex-1 truncate text-sm font-medium text-on-surface">{summary}</Text>
        <Text className="text-lg text-on-surface-variant">{open ? '▴' : '▾'}</Text>
      </Pressable>

      {open ? (
        <View className="mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <TextInput
            className="border-b border-outline-variant px-4 py-3 text-sm text-on-surface"
            placeholder={`Etsi ${INTRESSI_LABEL.toLowerCase()}ä...`}
            placeholderTextColor="#777587"
            value={query}
            onChangeText={setQuery}
          />
          <Pressable
            onPress={() => onActiveIdsChange([])}
            className={`flex-row items-center justify-between px-4 py-3 ${activeIds.length === 0 ? 'bg-primary/10' : ''}`}
          >
            <Text className={`text-sm ${activeIds.length === 0 ? 'font-medium text-primary' : 'text-on-surface'}`}>
              Kaikki intressit
            </Text>
          </Pressable>
          <ScrollView style={{ maxHeight: 240 }}>
            {filtered.map((item) => {
              const isSelected = activeIds.includes(item.id)
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onActiveIdsChange(toggleId(activeIds, item.id))}
                  className={`flex-row items-center justify-between border-t border-outline-variant px-4 py-3 ${isSelected ? 'bg-primary/10' : ''}`}
                >
                  <Text className={`flex-1 text-sm ${isSelected ? 'font-medium text-primary' : 'text-on-surface'}`}>
                    {isSelected ? '✓ ' : ''}
                    {item.name}
                  </Text>
                  <Text className="text-sm tabular-nums text-on-surface-variant">({item.taskCount})</Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      ) : null}

      {selectedItems.length > 0 ? (
        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {selectedItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onActiveIdsChange(activeIds.filter((id) => id !== item.id))}
              className="rounded-full bg-primary/10 px-3 py-1"
            >
              <Text className="text-xs font-medium text-primary">
                {formatFilterCountLabel(item.name, item.taskCount)} ×
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}
