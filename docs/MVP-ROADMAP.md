# MVP Roadmap — toteutuschecklist

Käytä tätä Cursor-agentin vaiheittaisena checklistinä. Merkitse valmiiksi kun vaihe on toteutettu.

## Vaihe 0 — Perusta

- [x] Dokumentaatio (`docs/`, `README.md`, `AGENTS.md`, `.cursor/rules/`)
- [ ] Turborepo + pnpm workspace scaffold
- [ ] `packages/config` — jaettu tsconfig, eslint, tailwind
- [ ] `packages/ui` — design tokenit DESIGN.md:stä
- [ ] `packages/db` — Drizzle + Neon connection
- [ ] `packages/core` — UnifiedTask tyypit
- [ ] `apps/web` — Next.js 15 skeleton
- [ ] `apps/mobile` — Expo Router skeleton
- [ ] `.env.example` kaikilla muuttujilla
- [ ] CI: `pnpm lint` + `pnpm typecheck`

## Vaihe 1 — Domain + API

- [ ] Drizzle-skeema: users, tasks, yhteispinnat, integration_connections, sync_logs
- [ ] Migraatiot ajettu Neonille
- [ ] `packages/core` — normalisointifunktiot (Linear, Notion, GCal)
- [ ] `GET /api/tasks` — listaus + filtterit
- [ ] `GET /api/tasks/today` — today-näkymä
- [ ] `GET /api/tasks/:id`
- [ ] `POST /api/tasks` — natiivi tehtävä
- [ ] `PATCH /api/tasks/:id`
- [ ] `DELETE /api/tasks/:id`
- [ ] `GET/POST/PATCH/DELETE /api/yhteispinnat`
- [ ] Freemium-middleware (`checkSubscriptionLimits`)

## Vaihe 2 — Auth

- [ ] Better Auth setup (`apps/web/lib/auth.ts`)
- [ ] Email + Google login
- [ ] Session middleware API-reiteille
- [ ] Expo auth flow (Bearer token)
- [ ] Login/register -näkymät (minimaalinen)

## Vaihe 3 — UI shell

- [ ] `packages/ui` — TopAppBar, BottomNav, Button, Input, Card, Badge
- [ ] Mobile: Expo Router tabs (Dashboard, Tasks, Calendar, Profile)
- [ ] Web: vastaavat Next.js -reitit
- [ ] Tehtävälista-näkymä (`ui/teht_v_lista/code.html`)
- [ ] Kalenteri-näkymä (`ui/kalenteri/code.html`)
- [ ] Tehtävän tiedot (`ui/teht_v_n_tiedot/code.html`)
- [ ] Today-dashboard (uusi design)
- [ ] Profiili-näkymä (integraatiot + asetukset)

## Vaihe 4 — Linear

- [ ] OAuth flow (`/api/integrations/linear/connect` + callback)
- [ ] Token encryption + storage
- [ ] `syncLinear()` — issue → UnifiedTask
- [ ] Webhook endpoint (`/api/webhooks/linear`)
- [ ] Write-back: status + priority
- [ ] UI: "Yhdistä Linear" profiilissa

## Vaihe 5 — Notion

- [ ] OAuth flow
- [ ] Database discovery (`GET /v1/search`)
- [ ] Käyttäjä valitsee tietokannat (UI)
- [ ] `syncNotion()` — page → UnifiedTask
- [ ] Property mapping (oletukset + konfiguroitava)
- [ ] UI: "Yhdistä Notion" profiilissa

## Vaihe 6 — Google Calendar

- [ ] OAuth flow (calendar.readonly scope)
- [ ] Calendar discovery
- [ ] Käyttäjä valitsee kalenterit (UI)
- [ ] `syncGoogleCalendar()` — event → UnifiedTask
- [ ] Kalenterinäkymä näyttää aikablokit
- [ ] UI: "Yhdistä Google Calendar" profiilissa

## Vaihe 7 — Synkka + muistutukset

- [ ] Vercel Cron: `POST /api/cron/sync-all` (5 min)
- [ ] `POST /api/integrations/:provider/sync` — manuaalinen synkka
- [ ] sync_logs kirjaus
- [ ] Expo push-notifikaatiot (`reminderAt`)
- [ ] Perusfiltterit UI:ssa (lähde, prioriteetti, intressi)

## Vaihe 8 — Freemium + deploy

- [ ] Stripe Checkout premium-tilaukseen
- [ ] Stripe webhook (subscription.created/updated/deleted)
- [ ] `subscriptionTier` päivitys
- [ ] Integraatiolimiitti free-tierille (max 3)
- [ ] Vercel production deploy
- [ ] EAS Build konfiguraatio

## Definition of Done (MVP)

MVP on valmis kun:

1. Käyttäjä voi rekisteröityä ja kirjautua (email + Google)
2. Käyttäjä voi yhdistää Linear, Notion ja Google Calendar
3. Tehtävät synkkaantuvat automaattisesti (cron + webhook)
4. Inbox, Today ja Kalenteri -näkymät toimivat mobiilissa ja webissä
5. Tehtävän voi merkitä valmiiksi (Linear write-back)
6. Muistutukset toimivat push-notifikaationa
7. Free-tier rajoittaa 3 integraatioon; premium avaa rajattomat
