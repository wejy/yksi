export type IntegrationAvailability = 'available' | 'coming_soon'

export interface IntegrationCatalogItem {
  id: string
  name: string
  icon: string
  description: string
  availability: IntegrationAvailability
}

/** MVP-integraatiot ensin, sitten mockupin muut (tulossa). */
export const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    id: 'linear',
    name: 'Linear',
    icon: 'linear_scale',
    description: 'Tuo issuet ja prioriteetit Yhteen.',
    availability: 'available',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: 'description',
    description: 'Synkronoi tehtävälistat tietokannoista Yhteen.',
    availability: 'available',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: 'calendar_month',
    description: 'Synkronoi tapaamiset automaattisesti Yhteen. Aseta muistutuksia.',
    availability: 'available',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'forum',
    description: 'Saa ilmoitukset suoraan kanaville.',
    availability: 'coming_soon',
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: 'mail',
    description: 'Hallitse sähköposteja ja kalenteria.',
    availability: 'coming_soon',
  },
  {
    id: 'jira',
    name: 'Jira',
    icon: 'bug_report',
    description: 'Synkronoi tiketit ja sprintit.',
    availability: 'coming_soon',
  },
]

export const MVP_INTEGRATION_IDS = INTEGRATION_CATALOG.filter(
  (i) => i.availability === 'available',
).map((i) => i.id)
