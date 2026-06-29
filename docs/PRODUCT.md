# Tuotevisio — Yksi

## Ongelma

Tehtävät hajautuvat Jiraan, Notioniin, Lineariin ja kalentereihin. Käyttäjän pitää itse koota päivän työkuva eri työkaluista.

## Ratkaisu

Yksi kokoaa kaikki tehtävät ja muistutukset yhteen näkymään — inbox, tänään-näkymä ja kalenteri.

## Ydinlupaus (MVP)

> Näe päivän tärkeimmät tehtävät yhdestä paikasta.

## Kohderyhmä

**Freelancerit ja startup-tekijät** — käyttävät 2–4 eri työkalua päivittäin, arvostavat nopeaa yleiskuvaa ennen syvällistä työskentelyä yksittäisissä työkaluissa.

## MVP-rajaus

### Mukana MVP:ssä

- 3 integraatiota: Linear, Notion, Google Calendar
- Inbox (tehtävälista) + Today (dashboard) + Kalenteri
- Tehtävän tiedot -näkymä (luku + perusmuokkaus)
- Muistutukset (`reminderAt` → push-notifikaatio)
- Perusfiltterit: lähde, prioriteetti, intressi
- Freemium: ilmainen 3 integraatiolla, premium rajattomilla
- Mobiili (Expo) + Web (Next.js) rinnakkain

### Ei mukana MVP:ssä

- Jira, Microsoft Calendar, Outlook
- AI-priorisointi, deduplikointi, työblokitus
- Automaatiosäännöt
- Kaksisuuntainen Notion/Calendar-synkka
- Tiimi-/organisaatiotuki

## Freemium-malli

| Ominaisuus | Ilmainen | Premium |
|------------|----------|---------|
| Integraatiot | 3 (Linear, Notion, GCal) | Rajaton |
| Inbox + Today | Kyllä | Kyllä |
| Kalenterinäkymä | Kyllä | Kyllä |
| Perusfiltterit | Kyllä | Kyllä |
| Kehittyneet filtterit | Ei | Kyllä |
| Kalenterisynkka (2-suuntainen) | Ei | Kyllä |
| Automaatiosäännöt | Ei | Myöhemmin |
| AI-priorisointi | Ei | Myöhemmin |

Katso yksityiskohdat: [FREEMIUM.md](FREEMIUM.md)

## Intressi (Common Ground)

Projektin sijasta käytetään termiä **Intressi** — jaettu konteksti johon tehtävät eri lähteistä ryhmittyvät. Koodissa ja tietokannassa käytetään edelleen nimitystä `yhteispinta`.

Esimerkkejä:
- "Työ" — Linear-tiimin tehtävät
- "Henkilökohtainen" — Notion-tietokannan tehtävät
- "Asiakas X" — cross-tool -projekti

Käyttäjä voi luoda intressejä manuaalisesti (`POST /api/yhteispinnat`) tai ne syntyvät automaattisesti integraatiolähteestä (esim. Linear Project → intressi).

## Ansaintalogiikka

1. **Aikasäästö** — ei tarvitse avata 4 appia aamulla
2. **Priorisointi** — today-näkymä näyttää tärkeimmät
3. **Muistuttaminen** — push-notifikaatiot yhteen paikkaan

Luontevin hinnoittelu: freemium + kuukausitilaus premiumille.

## Tulevaisuus (post-MVP)

- AI: "Mitä minun pitäisi tehdä tänään?"
- Deduplikointi: sama tehtävä Linearissa ja Notionissa
- Työblokitus: ehdota kalenteriin aikoja
- Lisäintegraatiot: Jira, Outlook, Todoist, Asana
- Automaatiosäännöt: "Kaikki Linear high → Intressi: Työ"
