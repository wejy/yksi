export type TaskSortBy = 'created_at' | 'due_at' | 'priority' | 'source'
export type TaskSortOrder = 'asc' | 'desc'

export const DEFAULT_TASK_SORT_BY: TaskSortBy = 'created_at'
export const DEFAULT_TASK_SORT_ORDER: TaskSortOrder = 'desc'

export const TASK_SORT_BY_OPTIONS: { value: TaskSortBy; label: string }[] = [
  { value: 'created_at', label: 'Lisäyspäivä' },
  { value: 'due_at', label: 'Deadline' },
  { value: 'priority', label: 'Prioriteetti' },
  { value: 'source', label: 'Integraatio' },
]

export const TASK_SORT_ORDER_OPTIONS: { value: TaskSortOrder; label: string }[] = [
  { value: 'asc', label: 'Nouseva' },
  { value: 'desc', label: 'Laskeva' },
]

export function isTaskSortBy(value: string): value is TaskSortBy {
  return TASK_SORT_BY_OPTIONS.some((o) => o.value === value)
}

export function isTaskSortOrder(value: string): value is TaskSortOrder {
  return value === 'asc' || value === 'desc'
}
