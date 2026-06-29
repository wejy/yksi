# Tech Stack

## Versiot

| Paketti | Versio | Huom |
|---------|--------|------|
| Node.js | 20+ | |
| pnpm | 9+ | Workspace manager |
| TypeScript | 5.7+ | Strict mode |
| Next.js | 15.x | App Router |
| React | 19.x | |
| Expo SDK | 52+ | |
| Expo Router | 4.x | File-based routing |
| Drizzle ORM | 0.38+ | |
| Better Auth | 1.x | |
| Tailwind CSS | 4.x | |
| shadcn/ui | latest | Web UI |
| NativeWind | 4.x | Mobile styling |
| Turborepo | 2.x | Monorepo build |
| Vitest | 2.x | Testit |
| Stripe | 17.x | Maksut (vaihe 8) |

## Ympäristömuuttujat

Kopioi `.env.example` → `.env.local` ja täytä arvot.

```env
# ─── Tietokanta ───
DATABASE_URL=postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/yksi?sslmode=require

# ─── Auth (Better Auth) ───
BETTER_AUTH_SECRET=          # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3069

# Google login (Better Auth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── Integraatiot ───
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=

NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=

# Google Calendar käyttää samoja GOOGLE_CLIENT_ID/SECRET
# Eri scope OAuth-flowssa

# ─── Salaus ───
INTEGRATION_TOKEN_ENCRYPTION_KEY=  # openssl rand -hex 32

# ─── Cron ───
CRON_SECRET=                   # openssl rand -base64 32

# ─── Stripe (vaihe 8) ───
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PREMIUM=      # Stripe Price ID kuukausihinnalle

# ─── Mobile ───
EXPO_PUBLIC_API_URL=http://localhost:3069
```

### Tuotanto (Vercel)

Aseta samat muuttujat Vercel Environment Variables -osiossa:
- `BETTER_AUTH_URL=https://yksi.app`
- `EXPO_PUBLIC_API_URL=https://yksi.app`

## Kehitysympäristön pystytys

### 1. Neon-tietokanta

1. Luo projekti [neon.tech](https://neon.tech)
2. Kopioi connection string → `DATABASE_URL`
3. Luo dev-branch kehitykseen (valinnainen)

### 2. Asenna riippuvuudet

```bash
pnpm install
```

### 3. Skeema tietokantaan

```bash
pnpm db:push      # Drizzle push (dev)
# tai
pnpm db:migrate   # Migraatiot (tuotanto)
```

### 4. Käynnistä kehityspalvelimet

```bash
pnpm dev          # Web (3069) + Mobile (Expo)
pnpm dev:web      # Vain web
pnpm dev:mobile   # Vain mobile
```

### 5. OAuth-sovellukset

Rekisteröi OAuth-appit:

| Provider | Callback URL |
|----------|-------------|
| Google (auth) | `http://localhost:3069/api/auth/callback/google` |
| Google (calendar) | `http://localhost:3069/api/integrations/google_calendar/callback` |
| Linear | `http://localhost:3069/api/integrations/linear/callback` |
| Notion | `http://localhost:3069/api/integrations/notion/callback` |

Tuotannossa vaihda `localhost:3069` → `yksi.app`.

## Komennot

| Komento | Kuvaus |
|---------|--------|
| `pnpm dev` | Käynnistä kaikki dev-serverit |
| `pnpm dev:web` | Next.js dev server |
| `pnpm dev:mobile` | Expo dev server |
| `pnpm build` | Tuotantobuild kaikille |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript tarkistus |
| `pnpm test` | Vitest |
| `pnpm db:push` | Drizzle push schema |
| `pnpm db:migrate` | Aja migraatiot |
| `pnpm db:studio` | Drizzle Studio (GUI) |
| `pnpm db:generate` | Generoi migraatio skeemamuutoksista |

## Deploy

### Web + API (Vercel)

```bash
# Vercel CLI tai GitHub-integraatio
vercel --prod
```

`vercel.json` sisältää cron-jobin:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-all",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Mobile (EAS)

```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
eas submit
```

## Ulkoiset palvelut

| Palvelu | Käyttö | Ilmainen tier |
|---------|--------|---------------|
| Neon | Postgres | 0.5 GB, 1 projekti |
| Vercel | Web + API + Cron | Hobby tier |
| EAS | Mobile builds | Rajoitettu |
| Stripe | Maksut | Pay-as-you-go |
| Linear API | Integraatio | OAuth ilmainen |
| Notion API | Integraatio | OAuth ilmainen |
| Google Calendar API | Integraatio | Ilmainen quota |
