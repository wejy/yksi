# AGENTS.md — Cursor-agentin ohjeet

Tämä tiedosto on Cursor-agentin ensisijainen ohje Yksi-projektin toteutukseen.

## Ennen koodausta

1. Lue [docs/PRODUCT.md](docs/PRODUCT.md) — ymmärrä MVP-rajaus
2. Lue [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — monorepo-rakenne
3. Toteutettavalle alueelle: lue vastaava docs/-tiedosto
4. UI-työhön: lue [docs/UI-IMPLEMENTATION.md](docs/UI-IMPLEMENTATION.md) ja avaa vastaava `ui/*/code.html` mockup

## Projektin periaatteet

- **Minimoi diff** — älä refaktoroi tai laajenna scopea pyytämättä
- **Yksi lähde totuudelle** — domain-mallit `packages/core`, skeema `packages/db`
- **Älä muuta `ui/`-mockupeja** — ne ovat referenssiä, toteutus menee `apps/` ja `packages/ui`
- **Brändi on Yksi** — mockupeissa lukee "Unified", käytä koodissa ja UI:ssa "Yksi"
- **Yhteispinta** — Common Ground -konsepti suomeksi; koodissa `yhteispinta` / `commonGrounds`

## Monorepo-konventiot

```
apps/mobile     → Expo Router, NativeWind
apps/web        → Next.js App Router, shadcn/ui
packages/ui     → Jaetut komponentit + design tokenit
packages/db     → Drizzle schema, migrations, client
packages/core   → Types, normalisointi, prioriteetti-logiikka
packages/integrations → Provider-spesifiset adapterit
packages/config → Jaettu tsconfig, eslint, tailwind
```

### Importit

```typescript
// Appit importtaavat paketteja workspace-aliasilla
import { db } from '@yksi/db'
import { UnifiedTask } from '@yksi/core'
import { Button } from '@yksi/ui'
import { syncLinear } from '@yksi/integrations'
```

### Nimeäminen

| Konteksti | Konventio | Esimerkki |
|-----------|-----------|-----------|
| Tiedostot | kebab-case | `task-card.tsx` |
| Komponentit | PascalCase | `TaskCard` |
| Funktiot | camelCase | `normalizeLinearIssue` |
| DB-taulut | snake_case | `integration_connections` |
| API-reitit | kebab-case | `/api/tasks/today` |
| Env-muuttujat | SCREAMING_SNAKE | `DATABASE_URL` |

## Toteutusjärjestys

Seuraa [docs/MVP-ROADMAP.md](docs/MVP-ROADMAP.md) -checklistiä vaiheittain. Älä hyppää integraatioihin ennen kuin domain-malli ja API ovat valmiit.

## Testaus

- Aja `pnpm typecheck` ja `pnpm lint` ennen valmistumista
- API-endpointit: testaa curlilla tai Vitest-integration testeillä
- UI: varmista että näkymä vastaa mockup-rakennetta (ei pikselintarkkaa)

## Commit-tyyli

```
feat(mobile): add task list screen from mockup
fix(api): correct Linear priority mapping
docs: update INTEGRATIONS.md webhook section
chore(db): add sync_logs migration
```

Prefixit: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

## Yleiset sudenkuopat

1. **Notion rate limits** — älä synkkaa kaikkia tietokantoja kerralla; käyttäjä valitsee
2. **Token security** — integraatiotokenit salataan AES-256:lla, ei koskaan logata
3. **Expo + shadcn** — mobiilissa NativeWind + jaetut tokenit, ei suoraa shadcn-kopiointia
4. **Freemium-rajat** — tarkista `subscriptionTier` middleware-tasolla, ei vain UI:ssa
5. **Kaksisuuntainen synkka** — vain Linear MVP:ssä; Notion ja Calendar read-only

## Kun olet epävarma

- Domain-malli → [docs/DATA-MODEL.md](docs/DATA-MODEL.md)
- API-sopimus → [docs/API.md](docs/API.md)
- Integraatio → [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)
- UI-rakenne → avaa vastaava `ui/*/code.html` + [docs/UI-IMPLEMENTATION.md](docs/UI-IMPLEMENTATION.md)
