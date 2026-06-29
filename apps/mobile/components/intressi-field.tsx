import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { apiFetch } from '@/lib/api'
import { INTRESSI_LABEL } from '@yksi/core'

export interface IntressiOption {
  id: string
  name: string
}

interface IntressiFieldProps {
  intressit: IntressiOption[]
  value: string | null
  onChange: (id: string | null) => void
  onCreated: (intressi: IntressiOption) => void
}

export function IntressiField({ intressit, value, onChange, onCreated }: IntressiFieldProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function handleCreate() {
    const name = newName.trim()
    if (!name) {
      setCreateError('Nimi on pakollinen')
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      const created = await apiFetch<IntressiOption>('/api/yhteispinnat', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      onCreated(created)
      onChange(created.id)
      setNewName('')
      setShowCreate(false)
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Intressin luonti epäonnistui')
    } finally {
      setCreating(false)
    }
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-on-surface-variant">{INTRESSI_LABEL}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Pressable
          onPress={() => onChange(null)}
          className={`mr-2 rounded-full px-4 py-2 ${value === null ? 'bg-primary' : 'bg-surface-container'}`}
        >
          <Text
            className={`text-sm ${value === null ? 'font-medium text-on-primary' : 'text-on-surface-variant'}`}
          >
            Ei intressiä
          </Text>
        </Pressable>
        {intressit.map((intressi) => (
          <Pressable
            key={intressi.id}
            onPress={() => onChange(intressi.id)}
            className={`mr-2 rounded-full px-4 py-2 ${value === intressi.id ? 'bg-primary' : 'bg-surface-container'}`}
          >
            <Text
              className={`text-sm ${value === intressi.id ? 'font-medium text-on-primary' : 'text-on-surface-variant'}`}
            >
              {intressi.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {!showCreate ? (
        <Pressable onPress={() => setShowCreate(true)} className="mt-2">
          <Text className="text-xs font-medium text-primary underline">+ Luo uusi intressi</Text>
        </Pressable>
      ) : (
        <View className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
          <Text className="mb-2 text-xs text-on-surface-variant">Uusi intressi</Text>
          <TextInput
            className="mb-2 rounded-lg border border-outline-variant px-3 py-2 text-sm"
            placeholder="Esim. Asiakas X"
            value={newName}
            onChangeText={setNewName}
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleCreate}
              disabled={creating}
              className={`rounded-full bg-primary px-4 py-2 ${creating ? 'opacity-60' : ''}`}
            >
              <Text className="text-sm font-medium text-on-primary">{creating ? '...' : 'Luo'}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowCreate(false)
                setCreateError('')
              }}
              className="px-2 py-2"
            >
              <Text className="text-sm text-on-surface-variant">Peruuta</Text>
            </Pressable>
          </View>
          {createError ? <Text className="mt-1 text-xs text-error">{createError}</Text> : null}
        </View>
      )}
    </View>
  )
}
