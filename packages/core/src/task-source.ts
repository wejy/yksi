import type { TaskSource } from './types'

export const TASK_SOURCE_META: Record<
  TaskSource,
  { label: string; icon: string; colorClass: string }
> = {
  linear: { label: 'Linear', icon: 'timeline', colorClass: 'bg-[#5E6AD2]/10 text-[#5E6AD2]' },
  notion: { label: 'Notion', icon: 'description', colorClass: 'bg-on-surface/5 text-on-surface' },
  google_calendar: {
    label: 'Kalenteri',
    icon: 'event',
    colorClass: 'bg-tertiary-container/30 text-tertiary',
  },
  native: { label: 'Yksi', icon: 'task_alt', colorClass: 'bg-primary/10 text-primary' },
}

export function getTaskSourceMeta(source: TaskSource) {
  return TASK_SOURCE_META[source] ?? TASK_SOURCE_META.native
}
