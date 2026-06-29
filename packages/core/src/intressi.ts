/** Finnish UI label for the `yhteispinta` domain concept (DB/code: `yhteispinta`). */
export const INTRESSI_LABEL = 'Intressi'

/** Above this count, intressi filter uses searchable combobox instead of chips. */
export const INTRESSI_FILTER_CHIP_LIMIT = 10

export function formatFilterCountLabel(label: string, count: number): string {
  return `${label} (${count})`
}

export const INTRESSI_COLOR_PRESETS = [
  { hex: '#3525cd', label: 'Sininen' },
  { hex: '#4f46e5', label: 'Indigo' },
  { hex: '#7c3aed', label: 'Violetti' },
  { hex: '#2563eb', label: 'Taivas' },
  { hex: '#0891b2', label: 'Syaani' },
  { hex: '#16a34a', label: 'Vihreä' },
  { hex: '#ca8a04', label: 'Keltainen' },
  { hex: '#ea580c', label: 'Oranssi' },
  { hex: '#dc2626', label: 'Punainen' },
  { hex: '#5c5f61', label: 'Harmaa' },
] as const

export const INTRESSI_ICON_PRESETS = [
  'work',
  'person',
  'groups',
  'target',
  'folder',
  'business',
  'school',
  'home',
  'star',
  'favorite',
  'lightbulb',
  'rocket_launch',
  'palette',
  'code',
  'campaign',
] as const

export type IntressiIconPreset = (typeof INTRESSI_ICON_PRESETS)[number]

export interface LinearTaskSourceDetail {
  stateName?: string
  teamName?: string
  projectName?: string
}

export function getLinearTaskSourceDetail(
  rawPayload: Record<string, unknown> | null | undefined,
): LinearTaskSourceDetail | null {
  if (!rawPayload) return null
  const state = rawPayload.state as { name?: string } | undefined
  const team = rawPayload.team as { name?: string } | undefined
  const project = rawPayload.project as { name?: string } | undefined
  if (!state?.name && !team?.name && !project?.name) return null
  return {
    stateName: state?.name,
    teamName: team?.name,
    projectName: project?.name,
  }
}
