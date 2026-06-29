# Sanasto / Glossary

## Tuote

| Suomi | Englanti | Kuvaus |
|-------|----------|--------|
| Yksi | Yksi | Tuotteen nimi. Unified tehtävienhallinta. |
| Intressi | Common Ground | Jaettu konteksti johon tehtävät ryhmittyvät. Korvaa "projektin". Linear-projekti → intressi. |
| Tehtävä | Task | Yksittäinen tehtävä tai kalenteritapahtuma. |
| Deadline | dueAt | Tehtävän määräaika (päivä + kellonaika). |
| Hälytysaika | reminderAt | Push-muistutuksen ajankohta (voi olla sama kuin deadline). |
| Lähde | Source | Mistä integraatiosta tehtävä tulee. |
| Inbox | Inbox | Kaikki avoimet tehtävät listana. |
| Tänään | Today | Päivän tärkeimmät tehtävät. |
| Synkka | Sync | Tietojen hakeminen integraatiosta. |

## Tekniset termit

| Termi | Kuvaus |
|-------|--------|
| UnifiedTask | Normalisoitu tehtävämalli johon kaikki integraatiot mapataan |
| integration_connection | Käyttäjän OAuth-yhteys ulkoiseen palveluun |
| externalId | Tehtävän ID lähdejärjestelmässä (esim. Linear issue ID) |
| externalUrl | Deep link takaisin lähdejärjestelmään |
| rawPayload | Alkuperäinen JSON-data lähdejärjestelmästä (debug/synkka) |
| write-back | Muutoksen synkkaaminen takaisin lähdejärjestelmään |
| yhteispinta / yhteispintaId | DB- ja kooditermi intressille (`yhteispinnat`-taulu, FK tehtävässä) |

## Integraatiot

| Provider | Enum-arvo | Kuvaus |
|----------|-----------|--------|
| Linear | `linear` | Issue tracker startup-tiimeille |
| Notion | `notion` | Tietokannat ja sivut |
| Google Calendar | `google_calendar` | Kalenteritapahtumat |
| Natiivi | `native` | Yksissä luotu tehtävä (ei integraatiosta) |

## Tehtävän tilat (status)

| Arvo | Suomi | Kuvaus |
|------|-------|--------|
| `open` | Avoin | Ei aloitettu |
| `in_progress` | Käynnissä | Työn alla |
| `done` | Valmis | Tehty |
| `cancelled` | Peruttu | Ei enää relevantti |

## Prioriteetit (priority)

| Arvo | Suomi | UI-badge |
|------|-------|----------|
| `urgent` | Kiireellinen | Korkea (punainen) |
| `high` | Korkea | Korkea (punainen) |
| `medium` | Normaali | Normaali (oranssi) |
| `low` | Matala | Matala (harmaa) |
| `none` | Ei prioriteettia | Ei badgea |

## Tilaus

| Arvo | Kuvaus |
|------|--------|
| `free` | Ilmainen — max 3 integraatiota |
| `premium` | Maksullinen — rajattomat integraatiot + lisäominaisuudet |

## UI-komponentit

| Komponentti | Kuvaus |
|-------------|--------|
| TopAppBar | Kiinteä yläpalkki (logo, avatar, notifikaatiot) |
| BottomNav | Alapalkin tab-navigaatio |
| TaskCard | Tehtäväkortti listassa |
| PriorityBadge | Prioriteetti-pill (Korkea/Normaali/Matala) |
| CategoryChip | Intressi-filtteri-pill |
| BentoSettingCard | Asetuskortti tehtävän tiedoissa |
| ProgressRing | Edistymisrengas today-näkymässä |
| TimedTaskCard | Aikaleimattu tehtävä kalenterissa |
| Fab | Floating action button (+) |

## Lyhenteet

| Lyhenne | Merkitys |
|---------|----------|
| MVP | Minimum Viable Product |
| OAuth | Open Authorization (kirjautumisprotokolla) |
| FK | Foreign Key (viiteavain tietokannassa) |
| CRUD | Create, Read, Update, Delete |
| GCal | Google Calendar |
