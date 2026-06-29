import { View, Text, TextInput, Pressable } from 'react-native'
import {
  DEADLINE_LABEL,
  REMINDER_LABEL,
  joinDatetimeLocal,
  splitDatetimeLocal,
} from '@yksi/core'

interface DeadlineReminderFieldsProps {
  deadline: string
  reminder: string
  onDeadlineChange: (value: string) => void
  onReminderChange: (value: string) => void
}

function DateTimeRow({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}) {
  const { date, time } = splitDatetimeLocal(value)

  function updateDate(nextDate: string) {
    onChange(joinDatetimeLocal(nextDate, time))
  }

  function updateTime(nextTime: string) {
    onChange(joinDatetimeLocal(date, nextTime))
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-on-surface-variant">{label}</Text>
      <View className="flex-row gap-2">
        <TextInput
          className="flex-1 rounded-lg border border-outline-variant px-3 py-2 text-sm"
          placeholder="2026-06-30"
          value={date}
          onChangeText={updateDate}
        />
        <TextInput
          className="w-24 rounded-lg border border-outline-variant px-3 py-2 text-sm"
          placeholder="14:00"
          value={time}
          onChangeText={updateTime}
        />
      </View>
      {value && onClear ? (
        <Pressable onPress={onClear} className="mt-1">
          <Text className="text-xs text-on-surface-variant underline">Tyhjennä</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

export function DeadlineReminderFields({
  deadline,
  reminder,
  onDeadlineChange,
  onReminderChange,
}: DeadlineReminderFieldsProps) {
  const sameAsDeadline = Boolean(deadline && reminder && deadline === reminder)

  return (
    <View>
      <DateTimeRow
        label={DEADLINE_LABEL}
        value={deadline}
        onChange={onDeadlineChange}
        onClear={() => onDeadlineChange('')}
      />
      <DateTimeRow
        label={REMINDER_LABEL}
        value={reminder}
        onChange={onReminderChange}
        onClear={() => onReminderChange('')}
      />
      <View className="mb-2 flex-row flex-wrap gap-x-4 gap-y-1">
        <Pressable onPress={() => deadline && onReminderChange(deadline)} disabled={!deadline}>
          <Text className={`text-xs text-primary underline ${!deadline ? 'opacity-40' : ''}`}>
            Kopioi deadlinesta
          </Text>
        </Pressable>
        <Pressable
          onPress={() => deadline && onReminderChange(deadline)}
          disabled={!deadline || sameAsDeadline}
        >
          <Text
            className={`text-xs text-primary underline ${!deadline || sameAsDeadline ? 'opacity-40' : ''}`}
          >
            Sama kuin deadline
          </Text>
        </Pressable>
      </View>
      <Text className="text-xs text-on-surface-variant">
        Päivämäärä (VVVV-KK-PP) ja kellonaika (TT:MM). Deadline ja hälytys voivat olla eri tai samat.
      </Text>
    </View>
  )
}
