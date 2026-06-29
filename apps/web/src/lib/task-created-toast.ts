const STORAGE_KEY = 'yksi_task_created_toast'

export interface TaskCreatedToastPayload {
  taskId: string
  title: string
  description: string | null
}

export function setTaskCreatedToast(payload: TaskCreatedToastPayload) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function consumeTaskCreatedToast(): TaskCreatedToastPayload | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  sessionStorage.removeItem(STORAGE_KEY)

  try {
    const parsed = JSON.parse(raw) as TaskCreatedToastPayload
    if (!parsed?.title?.trim() || !parsed?.taskId?.trim()) return null
    return {
      taskId: parsed.taskId.trim(),
      title: parsed.title.trim(),
      description: parsed.description?.trim() || null,
    }
  } catch {
    return null
  }
}
