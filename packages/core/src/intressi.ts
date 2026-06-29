/** Finnish UI label for the `yhteispinta` domain concept (DB/code: `yhteispinta`). */
export const INTRESSI_LABEL = 'Intressi'

/** Above this count, intressi filter uses searchable combobox instead of chips. */
export const INTRESSI_FILTER_CHIP_LIMIT = 10

export function formatFilterCountLabel(label: string, count: number): string {
  return `${label} (${count})`
}

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
