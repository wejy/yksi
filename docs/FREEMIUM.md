# Freemium-malli

## Tasot

### Ilmainen (Free)

**Hinta:** 0 €/kk

**Sisältää:**
- 3 integraatiota (Linear, Notion, Google Calendar — juuri täynnä)
- Inbox (tehtävälista)
- Today-näkymä
- Kalenterinäkymä
- Tehtävän tiedot
- Perusfiltterit (lähde, prioriteetti, intressi)
- Push-muistutukset
- Natiivitehtävien luonti

**Rajoitukset:**
- Max 3 integraatiota
- Ei kehittyneitä filttereitä (saved filters, monimutkainen AND/OR)
- Ei kaksisuuntaista kalenterisynkkaa
- Ei automaatiosääntöjä
- Ei AI-priorisointia

### Premium

**Hinta:** 9 €/kk (ehdotus, päivitetään Stripe Price ID:llä)

**Sisältää kaiken ilmaisesta plus:**
- Rajattomat integraatiot (tulevaisuudessa Jira, Outlook, Todoist...)
- Kehittyneet filtterit ja tallennetut näkymät
- Kaksisuuntainen kalenterisynkka (tulevaisuudessa)
- Automaatiosäännöt (tulevaisuudessa)
- AI-priorisointi ja "mitä teen tänään" (tulevaisuudessa)
- Ensisijainen tuki

## Toteutus

### Tietokanta

```sql
-- users-taulussa
subscription_tier: 'free' | 'premium'  -- default 'free'
stripe_customer_id: text | null
stripe_subscription_id: text | null
```

### Rajojen tarkistus

```typescript
// packages/core/src/subscription.ts
const FREE_INTEGRATION_LIMIT = 3

function canAddIntegration(user: User, currentCount: number): boolean {
  if (user.subscriptionTier === 'premium') return true
  return currentCount < FREE_INTEGRATION_LIMIT
}

function canUseAdvancedFilters(user: User): boolean {
  return user.subscriptionTier === 'premium'
}
```

### API-middleware

```typescript
// apps/web/lib/middleware/freemium.ts
async function checkIntegrationLimit(userId: string) {
  const user = await getUser(userId)
  if (user.subscriptionTier === 'premium') return

  const count = await countConnections(userId)
  if (count >= FREE_INTEGRATION_LIMIT) {
    throw new ApiError(403, 'INTEGRATION_LIMIT_REACHED',
      'Ilmainen tili tukee max 3 integraatiota. Päivitä Premiumiin.')
  }
}
```

### Stripe-integraatio

**Tuotteet:**
- `premium_monthly` — 9 €/kk toistuva
- (tulevaisuudessa) `premium_yearly` — 79 €/vuosi

**Flow:**
1. Käyttäjä painaa "Päivitä Premiumiin" profiilissa
2. `POST /api/billing/checkout` → Stripe Checkout Session
3. Käyttäjä maksaa → Stripe webhook `checkout.session.completed`
4. Päivitä `subscription_tier = 'premium'`
5. Peruutus: webhook `customer.subscription.deleted` → `subscription_tier = 'free'`

**Webhook-endpoint:** `POST /api/billing/webhook`

Käsiteltävät eventit:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### UI-upsell

Näytä premium-kehotus kun:
- Käyttäjä yrittää yhdistää 4. integraation
- Käyttäjä yrittää käyttää kehittynyttä filtteriä
- Profiili-sivulla "Päivitä Premiumiin" -kortti (free-käyttäjille)

Upsell-kortin sisältö:
- Otsikko: "Avaa rajattomat integraatiot"
- Lista premium-ominaisuuksista
- CTA: "Aloita 9 €/kk" → Stripe Checkout

## Hinnoittelustrategia

| Vaihe | Strategia |
|-------|-----------|
| MVP launch | Free kaikille, premium vain integraatiorajalle |
| +3 kk | Lisää kehittyneet filtterit premiumiin |
| +6 kk | Lisää AI-priorisointi premiumiin |
| +12 kk | Lisää tiimi-/organisaatiopaketti |

## Metriikat

Seuraa:
- Free → Premium conversion rate
- Integraatioiden määrä per käyttäjä
- DAU/MAU (päivittäiset/kuukausittaiset aktiiviset)
- Churn rate (premium-peruutukset)
