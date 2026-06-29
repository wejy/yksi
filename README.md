# Yksi

Unified tehtävienhallinta — kaikki tehtävät ja muistutukset yhteen näkymään.

Yksi kokoaa tehtävät Linearista, Notionista, Google Calendarista ja muista lähteistä yhteen mobiili- ja web-kokemukseen. MVP-kohderyhmä: freelancerit ja startup-tekijät.

## Ydinlupaus

> Näe päivän tärkeimmät tehtävät yhdestä paikasta.

## Tech stack

| Kerros | Teknologia |
|--------|------------|
| Mobiili | Expo SDK 52+ / Expo Router |
| Web + API | Next.js 15 (App Router) |
| Tietokanta | Neon Postgres + Drizzle ORM |
| Auth | Better Auth |
| UI | shadcn/ui + Radix + Tailwind v4 |
| Deploy | Vercel (web/API), EAS (mobiili) |

## Kansiorakenne

```
yksi/
├── apps/
│   ├── mobile/          # Expo (React Native)
│   └── web/             # Next.js — API + web UI
├── packages/
│   ├── ui/              # Jaettu shadcn/Radix + design tokenit
│   ├── db/              # Drizzle ORM + skeema
│   ├── core/            # Domain-mallit, normalisointi
│   ├── integrations/    # Linear, Notion, Google Calendar
│   └── config/          # Jaettu ESLint, TS, Tailwind
├── ui/                  # HTML-mockupit (referenssi, älä muuta)
├── docs/                # Toteutusdokumentaatio
└── AGENTS.md            # Cursor-agentin ohjeet
```

## Pika-aloitus

### Vaatimukset

- Node.js 20+
- pnpm 9+
- Neon-tietokanta (tai paikallinen Postgres)

### Asennus

```bash
pnpm install
cp .env.example .env.local
# Täytä .env.local (katso docs/TECH-STACK.md)

pnpm db:push        # Drizzle-skeema Neonille
pnpm dev            # Käynnistä web + mobile rinnakkain
```

### Kehityskomennot

```bash
pnpm dev            # Kaikki appit (Turborepo)
pnpm dev:web        # Vain Next.js (localhost:3000)
pnpm dev:mobile     # Vain Expo
pnpm lint           # ESLint kaikille paketeille
pnpm typecheck      # TypeScript
pnpm db:studio      # Drizzle Studio
```

## Dokumentaatio

| Tiedosto | Kuvaus |
|----------|--------|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Tuotevisio, MVP-rajaus, freemium |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arkkitehtuuri ja datavirrat |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Tietokantaskeema, normalisointi |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | Linear, Notion, Google Calendar |
| [docs/API.md](docs/API.md) | REST API -referenssi |
| [docs/UI-IMPLEMENTATION.md](docs/UI-IMPLEMENTATION.md) | Mockup → komponentti -mapping |
| [docs/MVP-ROADMAP.md](docs/MVP-ROADMAP.md) | Vaiheittainen toteutuschecklist |
| [docs/TECH-STACK.md](docs/TECH-STACK.md) | Versiot, env-muuttujat |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | Domain-termit (Yhteispinta jne.) |
| [docs/FREEMIUM.md](docs/FREEMIUM.md) | Ilmainen vs premium |
| [AGENTS.md](AGENTS.md) | Cursor-agentin ohjeet |

## UI-mockupit

HTML-prototyypit löytyvät `ui/`-kansiosta. Ne ovat referenssiä — toteutus käyttää shadcn/ui-komponentteja ja design tokenit `packages/ui`-paketista.

- `ui/teht_v_lista/code.html` — Tehtävälista
- `ui/kalenteri/code.html` — Kalenteri
- `ui/teht_v_n_tiedot/code.html` — Tehtävän tiedot
- `ui/dashboard/code.html` — Dashboard (stub)
- `ui/unified_design_system/DESIGN.md` — Design system

## Lisenssi

Proprietary — kaikki oikeudet pidätetään.
