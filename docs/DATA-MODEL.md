# Tietomalli

## Intressi (`yhteispinnat`)

Intressi korvaa perinteisen "projektin" käsitteen. Se on jaettu konteksti johon tehtävät eri lähteistä ryhmittyvät. UI:ssa termi on **Intressi**; tietokannassa taulu `yhteispinnat`.

```typescript
interface Yhteispinta {
  id: string          // UUID
  userId: string
  name: string        // esim. "Työ", "Asiakas X"
  color: string | null  // hex, esim. "#3525cd"
  icon: string | null   // Material Symbol name
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}
```

**Automaattinen vs manuaalinen:**
- Linear Project/Team → automaattinen intressi synkan yhteydessä
- Käyttäjä voi luoda intressejä manuaalisesti ja liittää tehtäviä

## UnifiedTask

Kaikki integraatiot normalisoidaan tähän malliin.

```typescript
type TaskSource = 'linear' | 'notion' | 'google_calendar' | 'native'
type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled'
type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

interface UnifiedTask {
  id: string
  userId: string
  source: TaskSource
  externalId: string | null
  externalUrl: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueAt: Date | null
  startAt: Date | null
  endAt: Date | null
  reminderAt: Date | null
  yhteispintaId: string | null
  labels: string[]
  completedAt: Date | null
  syncedAt: Date
  rawPayload: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
```

## Tietokantataulut

### users

Better Auth hallinnoi käyttäjiä. Lisäkentät:

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | uuid PK | |
| subscription_tier | enum | `free` \| `premium` |
| stripe_customer_id | text | nullable |
| timezone | text | default `Europe/Helsinki` |

### tasks

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| source | task_source enum | |
| external_id | text | nullable, unique per (user_id, source) |
| external_url | text | nullable |
| title | text | |
| description | text | nullable |
| status | task_status enum | |
| priority | task_priority enum | |
| due_at | timestamptz | nullable |
| start_at | timestamptz | nullable |
| end_at | timestamptz | nullable |
| reminder_at | timestamptz | nullable |
| yhteispinta_id | uuid FK → yhteispinnat | nullable |
| labels | text[] | |
| completed_at | timestamptz | nullable |
| synced_at | timestamptz | |
| raw_payload | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Unique constraint:** `(user_id, source, external_id)` WHERE external_id IS NOT NULL

### yhteispinnat

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| name | text | |
| color | text | nullable |
| icon | text | nullable |
| source_mapping | jsonb | nullable, esim. `{ linearProjectId: "..." }` |
| sort_order | integer | default 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### integration_connections

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| provider | integration_provider enum | `linear` \| `notion` \| `google_calendar` |
| access_token_encrypted | text | AES-256 |
| refresh_token_encrypted | text | nullable |
| token_expires_at | timestamptz | nullable |
| status | connection_status enum | `active` \| `disconnected` \| `error` |
| metadata | jsonb | provider-spesifiset asetukset |
| last_synced_at | timestamptz | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Unique constraint:** `(user_id, provider)`

### sync_logs

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | uuid PK | |
| connection_id | uuid FK → integration_connections | |
| status | sync_status enum | `success` \| `error` \| `partial` |
| tasks_created | integer | default 0 |
| tasks_updated | integer | default 0 |
| error_message | text | nullable |
| started_at | timestamptz | |
| completed_at | timestamptz | nullable |

## Normalisointisäännöt

### Linear Issue → UnifiedTask

| Linear | UnifiedTask |
|--------|-------------|
| `title` | `title` |
| `description` | `description` |
| `state.type` (backlog/unstarted/started/completed/canceled) | `status` |
| `priority` (0=none, 1=urgent, 2=high, 3=medium, 4=low) | `priority` |
| `dueDate` | `dueAt` |
| `labels[].name` | `labels` |
| `project.name` tai `team.name` | → `yhteispinta` (auto-create) |
| `url` | `externalUrl` |
| `id` | `externalId` |

**Status-mapping:**
- `backlog`, `unstarted` → `open`
- `started` → `in_progress`
- `completed` → `done`
- `canceled` → `cancelled`

**Priority-mapping:**
- 0 → `none`, 1 → `urgent`, 2 → `high`, 3 → `medium`, 4 → `low`

### Notion Page → UnifiedTask

| Notion | UnifiedTask |
|--------|-------------|
| Title property | `title` |
| Rich text / description property | `description` |
| Status property | `status` |
| Date property (end) | `dueAt` |
| Date property (start) | `startAt` |
| Select/Multi-select | `labels` |
| Database name | → `yhteispinta` (auto-create) |
| `url` | `externalUrl` |
| `id` | `externalId` |

### Google Calendar Event → UnifiedTask

| Google Calendar | UnifiedTask |
|-----------------|-------------|
| `summary` | `title` |
| `description` | `description` |
| `start.dateTime` | `startAt` |
| `end.dateTime` | `endAt` |
| `reminders.overrides[0]` | `reminderAt` |
| Calendar name | → `yhteispinta` (auto-create) |
| `htmlLink` | `externalUrl` |
| `id` | `externalId` |

Kalenteritapahtumat ovat aina `status: open` (tai `done` jos mennyt).

## Indeksit

```sql
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_at) WHERE due_at IS NOT NULL;
CREATE INDEX idx_tasks_user_reminder ON tasks(user_id, reminder_at) WHERE reminder_at IS NOT NULL;
CREATE INDEX idx_tasks_user_source ON tasks(user_id, source);
CREATE INDEX idx_tasks_yhteispinta ON tasks(yhteispinta_id);
```
