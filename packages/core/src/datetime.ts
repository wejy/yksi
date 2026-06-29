export const DEADLINE_LABEL = 'Deadline'
export const REMINDER_LABEL = 'Hälytysaika'

/** Format ISO timestamp for `<input type="datetime-local">` (local timezone). */
export function toDatetimeLocalValue(iso: string | Date | null | undefined): string {
  if (!iso) return ''
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Parse `datetime-local` value to ISO string, or null if empty/invalid. */
export function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function splitDatetimeLocal(value: string): { date: string; time: string } {
  if (!value) return { date: '', time: '' }
  const [date = '', time = ''] = value.split('T')
  return { date, time: time.slice(0, 5) }
}

export function joinDatetimeLocal(date: string, time: string): string {
  if (!date.trim()) return ''
  return `${date}T${time.trim() || '09:00'}`
}
