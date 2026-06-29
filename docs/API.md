# API-referenssi

Base URL: `https://yksi.app/api` (tuotanto) / `http://localhost:3069/api` (dev)

Autentikointi: Better Auth session cookie (web) tai `Authorization: Bearer <token>` (mobile).

## Tehtävät

### GET /api/tasks

Hae käyttäjän tehtävät.

**Query parametrit:**

| Parametri | Tyyppi | Kuvaus |
|-----------|--------|--------|
| `status` | string | `open`, `in_progress`, `done`, `cancelled` |
| `source` | string | `linear`, `notion`, `google_calendar`, `native` |
| `priority` | string | `none`, `low`, `medium`, `high`, `urgent` |
| `yhteispintaId` | uuid | Suodata intressin mukaan |
| `dueBefore` | ISO date | Erääntyy ennen |
| `dueAfter` | ISO date | Erääntyy jälkeen |
| `search` | string | Hae otsikosta/kuvauksesta |
| `limit` | number | default 50, max 100 |
| `offset` | number | default 0 |

**Response 200:**

```json
{
  "tasks": [
    {
      "id": "uuid",
      "source": "linear",
      "externalId": "LIN-123",
      "externalUrl": "https://linear.app/...",
      "title": "Q4-raportin viimeistely",
      "description": "Kerää luvut...",
      "status": "open",
      "priority": "high",
      "dueAt": "2026-06-30T17:00:00Z",
      "startAt": null,
      "endAt": null,
      "reminderAt": "2026-06-30T14:00:00Z",
      "yhteispintaId": "uuid",
      "yhteispinta": { "id": "uuid", "name": "Työ", "color": "#3525cd" },
      "labels": ["raportti", "q4"],
      "completedAt": null,
      "syncedAt": "2026-06-29T10:00:00Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### GET /api/tasks/today

Hae tämän päivän tärkeimmät tehtävät (today-näkymä).

Palauttaa tehtävät joilla:
- `dueAt` on tänään TAI
- `reminderAt` on tänään TAI
- `startAt` on tänään (kalenteritapahtumat)

Järjestys: prioriteetti (urgent first) → dueAt → reminderAt.

**Response 200:**

```json
{
  "tasks": [...],
  "summary": {
    "total": 8,
    "completed": 3,
    "remaining": 5
  }
}
```

### GET /api/tasks/:id

Hae yksittäinen tehtävä.

**Response 200:** Yksittäinen task-objekti (yllä oleva muoto).

**Response 404:** `{ "error": "Task not found", "code": "TASK_NOT_FOUND" }`

### POST /api/tasks

Luo natiivi tehtävä (ei integraatiosta).

**Request body:**

```json
{
  "title": "Uusi tehtävä",
  "description": "Valinnainen kuvaus",
  "priority": "medium",
  "dueAt": "2026-07-01T12:00:00Z",
  "reminderAt": "2026-07-01T09:00:00Z",
  "yhteispintaId": "uuid"
}
```

**Response 201:** Luotu task-objekti.

### PATCH /api/tasks/:id

Päivitä tehtävä. Jos lähde on Linear ja kenttä on tuettu, synkkaa takaisin.

**Request body (kaikki valinnaisia):**

```json
{
  "title": "Päivitetty otsikko",
  "description": "...",
  "status": "done",
  "priority": "high",
  "dueAt": "2026-07-01T12:00:00Z",
  "reminderAt": null,
  "yhteispintaId": "uuid"
}
```

**Response 200:** Päivitetty task-objekti.

### DELETE /api/tasks/:id

Poista natiivi tehtävä. Integraatiotehtäviä ei voi poistaa (vain piilottaa).

**Response 204:** No content.

---

## Intressit (`/api/yhteispinnat`)

Koodissa ja tietokannassa `yhteispinnat`; API-vastauksissa avain `intressit`.

### GET /api/yhteispinnat

**Query:** `usedInTasks=true` — palauttaa vain intressit joissa on vähintään yksi tehtävä.

**Response 200:**

```json
{
  "intressit": [
    {
      "id": "uuid",
      "name": "Työ",
      "color": "#3525cd",
      "icon": "work",
      "sortOrder": 0,
      "taskCount": 12
    }
  ]
}
```

### POST /api/yhteispinnat

Luo manuaalinen intressi.

```json
{ "name": "Asiakas X", "color": "#7e3000", "icon": "person" }
```

**Response 201:** Luotu intressi-objekti.

### PATCH /api/yhteispinnat/:id

### DELETE /api/yhteispinnat/:id

---

## Integraatiot

### GET /api/integrations

Listaa käyttäjän yhdistetyt integraatiot.

```json
{
  "connections": [
    {
      "id": "uuid",
      "provider": "linear",
      "status": "active",
      "lastSyncedAt": "2026-06-29T10:00:00Z",
      "metadata": { "teamName": "Engineering" }
    }
  ]
}
```

### GET /api/integrations/:provider/connect

Aloita OAuth-flow. Redirect providerin authorize-sivulle.

### GET /api/integrations/:provider/callback

OAuth callback (provider redirectaa tänne).

### DELETE /api/integrations/:provider

Katkaise integraatioyhteys.

### POST /api/integrations/:provider/sync

Manuaalinen synkronointi (käyttäjä painaa "Synkkaa nyt").

---

## Webhookit

### POST /api/webhooks/linear

Linear webhook-endpoint. Validoi `Linear-Signature` header.

---

## Cron

### POST /api/cron/sync-all

Vercel Cron kutsuu tätä. Vaatii `Authorization: Bearer $CRON_SECRET`.

---

## Käyttäjä / tilaus

### GET /api/user/me

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "subscriptionTier": "free",
  "timezone": "Europe/Helsinki"
}
```

### POST /api/billing/checkout

Luo Stripe Checkout -sessio premium-tilaukseen.

### POST /api/billing/webhook

Stripe webhook (subscription events).

---

## Virhekoodit

| Koodi | HTTP | Kuvaus |
|-------|------|--------|
| `UNAUTHORIZED` | 401 | Ei sessiota |
| `FORBIDDEN` | 403 | Freemium-raja ylitetty |
| `TASK_NOT_FOUND` | 404 | Tehtävää ei löydy |
| `INTEGRATION_ERROR` | 502 | Ulkoinen API epäonnistui |
| `RATE_LIMITED` | 429 | Liikaa pyyntöjä |

**Virhemuoto:**

```json
{
  "error": "Integration limit reached for free tier",
  "code": "FORBIDDEN"
}
```
