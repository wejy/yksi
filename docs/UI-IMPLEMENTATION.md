# UI-toteutus — Mockup → komponentti

## Periaate

HTML-mockupit `ui/`-kansiossa ovat **referenssiä**. Toteutus käyttää shadcn/ui + Radix (web) ja NativeWind (mobile) design tokenien kanssa `packages/ui`-paketista.

**Älä muuta mockup-tiedostoja.** Brändi on **Yksi** kaikissa näkymissä.

## Näkymäkartta

| Mockup | Tiedosto | Mobile route | Web route | Status |
|--------|----------|--------------|-----------|--------|
| Tehtävälista | `ui/teht_v_lista/code.html` | `app/(tabs)/tasks` | `app/tasks` | P0 |
| Kalenteri | `ui/kalenteri/code.html` | `app/(tabs)/calendar` | `app/calendar` | P0 |
| Tehtävän tiedot | `ui/teht_v_n_tiedot/code.html` | `app/task/[id]` | `app/task/[id]` | P0 |
| Dashboard/Today | `ui/dashboard_korjattu/code.html` | `app/(tabs)/index` | `app/` | P0 |
| Profiili + integraatiot | `ui/profiili_ja_integraatiot/code.html` | `app/(tabs)/profile` | `app/profile` | P0 |
| Dashboard (vanha stub) | `ui/dashboard/code.html` | — | — | Deprecated |

## Jaettu app shell

Kaikissa tab-näkymissä (paitsi tehtävän tiedot):

```
┌─────────────────────────────┐
│ TopAppBar (64px, fixed)     │
│  Avatar | Yksi | 🔔         │
├─────────────────────────────┤
│                             │
│  Screen content             │
│  (scrollable)               │
│                             │
├─────────────────────────────┤
│ BottomNav (fixed)           │
│ Dashboard|Tasks|Cal|Profile │
└─────────────────────────────┘
```

### TopAppBar

- Korkeus: 64px (`h-16`)
- Tausta: `bg-surface-container-lowest/80 backdrop-blur-md`
- Vasen: avatar (32px) + "Yksi" (`text-lg font-bold`)
- Oikea: notifications-ikoni (Material Symbols `notifications`)
- Tehtävän tiedot -näkymässä: back-nappi + otsikko + more-menu

### BottomNav

4 tabia, aktiivinen = `text-primary` + `fill` ikoni:

| Tab | Ikoni | Label |
|-----|-------|-------|
| Dashboard | `dashboard` | Etusivu |
| Tasks | `checklist` | Tehtävät |
| Calendar | `calendar_month` | Kalenteri |
| Profile | `person` | Profiili |

## Komponenttikirjasto (`packages/ui`)

| Komponentti | Mockup-lähde | Kuvaus |
|-------------|--------------|--------|
| `TopAppBar` | kaikki mockupit | Kiinteä yläpalkki |
| `BottomNav` | teht_v_lista, kalenteri | Tab-navigaatio |
| `TaskCard` | teht_v_lista | Checkbox + title + badge + metadata |
| `PriorityBadge` | teht_v_lista | Korkea/Normaali/Matala |
| `CategoryChip` | teht_v_lista | Pill-tabs (Kaikki, Työ, Koti...) |
| `SearchBar` | teht_v_lista | Haku + filtteri-ikoni |
| `Fab` | teht_v_lista | Floating action button (+) |
| `CalendarGrid` | kalenteri | Kuukausinäkymä 7-sarakkeinen |
| `CalendarDayCell` | kalenteri | Päivänumero + dot-indikaattorit |
| `TimedTaskCard` | kalenteri | Aikaleima + värillinen vasen reuna |
| `BentoSettingCard` | teht_v_n_tiedot | 3-col asetuskortit |
| `SubtaskList` | teht_v_n_tiedot | Alitehtävälista checkboxeilla |
| `ProgressRing` | dashboard (stub CSS) | Today-näkymän edistymisrengas |

## Näkymäkohtaiset speksit

### Tehtävälista (Inbox)

**Mockup:** `ui/teht_v_lista/code.html`

Rakenne:
1. SearchBar — "Etsi tehtäviä..."
2. CategoryChip-rivi — filtterit (API: yhteispinnat tai lähteet)
3. TaskCard-lista — `space-y-3`
4. FAB — oikea alakulma, `+` ikoni

TaskCard-sisältö:
- Checkbox (vasen) — toggle `status: done`
- Otsikko (`font-semibold`) + kuvaus (`text-sm text-on-surface-variant`)
- PriorityBadge (oikea ylä)
- Metadata-rivi: due date ikoni + päivämäärä, kategoria-ikoni + nimi

### Kalenteri

**Mockup:** `ui/kalenteri/code.html`

Rakenne:
1. Kuukausi-header — "Kesäkuu 2026", tehtävämäärä, prev/next
2. CalendarGrid — MA-SU, dot-indikaattorit päiville joilla tehtäviä
3. Päivän agenda — valitun päivän TimedTaskCard-lista

TimedTaskCard:
- Vasen reuna: 1.5px värillinen border (primary/tertiary/secondary)
- Aika: `font-semibold`
- Otsikko + kuvaus

### Tehtävän tiedot

**Mockup:** `ui/teht_v_n_tiedot/code.html`

Ei BottomNav — käytä footer action baria.

Rakenne:
1. TopAppBar — back + "Tehtävän tiedot" + more
2. Otsikko-input (h2-kokoinen, borderless)
3. Kuvaus-textarea
4. BentoSettingCard-grid (3 col):
   - Hälytysaika (`reminderAt`)
   - Deadline (`dueAt`)
   - Intressi (`yhteispintaId`)
5. SubtaskList (MVP: vain natiivitehtäville, integraatioissa piilota)
6. Footer: "Tallenna muutokset" — primary pill button

### Dashboard / Today

**Mockup:** `ui/dashboard_korjattu/code.html`

Rakenne:
1. Header — Yksi-logo + ilmoitukset + käyttäjäavatar
2. Edistymiskortti — "Tämän päivän edistyminen", X/Y valmiina, progress ring + prosentti
3. Stats-grid (2 col) — Odottavat tehtävät, Tehtäviä tänään
4. "Päivän poiminnat" — ikonipohjaiset tehtäväkortit (ei checkboxeja), chevron_right
5. "Uusi tehtävä" — täysleveä primary CTA

### Profiili + integraatiot

**Mockup:** `ui/profiili_ja_integraatiot/code.html`

Rakenne:
1. Header — "Profiili" + ilmoitukset
2. Profiili-header — avatar (keskitetty), nimi, email, tilaus-badge
3. Premium-upsell (free-käyttäjille)
4. Tilin asetukset — listakortti: Henkilötiedot, Ilmoitukset, Teema
5. Integraatiot — grid-kortit (h-40): ikoni, Yhdistetty/Yhdistä-badge, nimi + kuvaus
6. Kirjaudu ulos — error-container -tyylinen nappi
7. Versiotiedot alareunassa

## Design tokenit

Lähde: `ui/unified_design_system/DESIGN.md` → `packages/ui/src/tokens/`

Keskeiset värit:
- `primary`: `#3525cd`
- `background` / `surface`: `#f8f9ff`
- `on-surface`: `#0b1c30`
- `error`: `#ba1a1a` (korkea prioriteetti)
- `tertiary`: `#7e3000` (normaali prioriteetti)

Fontti: Inter (Google Fonts / expo-google-fonts)

Ikonit: Material Symbols Outlined

## Responsiivisuus

- Mobile-first (`max-w-2xl` centered)
- Desktop (web): `max-w-4xl`, sidebar-navigaatio voi korvata BottomNavin `lg:` breakpointissa

## Toteutusjärjestys UI:lle

1. Design tokenit + peruskomponentit (Button, Input, Card, Badge)
2. App shell (TopAppBar, BottomNav)
3. TaskCard + TaskList (tehtävälista)
4. CalendarGrid + TimedTaskCard (kalenteri)
5. Task detail form (tehtävän tiedot)
6. Today dashboard (uusi)
7. Profile + integraatiot (uusi)
