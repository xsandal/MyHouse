# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Kommandoer

```bash
# Installer afhængigheder (sæt PATH først på Windows)
npm install

# Start dev-server
npm run dev

# Byg til produktion
npm run build

# Forhåndsvisning af production build
npm run preview
```

**OBS – Windows PATH:** Node.js er installeret i `C:\Program Files\nodejs\` men er ikke i shell-PATH automatisk. Brug fuld sti eller åbn en ny terminal efter installation:
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
```

## Tech stack

| Lag | Teknologi |
|---|---|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS 3 (farvepalette via CSS-variabler) |
| PWA | vite-plugin-pwa, Workbox |
| Database | Firebase Firestore (realtid) |
| Auth | Firebase Authentication (Google) |
| Filer | Firebase Storage |
| Baggrundsjobs | Firebase Cloud Functions (Node.js) |
| Notifikationer | Web Push via Firebase Admin SDK |
| AI | Claude API kaldt fra Cloud Functions |

## Arkitektur

Appen er en PWA til to brugere der deler én have. Alle brugere tilhører en `garden` og al data er scoped til `gardenId`.

**Firestore-collections:**
- `users/{userId}` – profil + FCM-tokens til push
- `gardens/{gardenId}` – navn, members[], inviteCode
- `items/{itemId}` – planter OG husopgaver (unified), skelnes på `category: 'garden' | 'house'`
- `reminders/{reminderId}` – påmindelser knyttet til et item via `itemId`
- `experiences/{experienceId}` – noter/erfaringer pr. item
- `careAdvice/{itemId}` – cachet Claude API-svar (90 dage, invalideres ved navn/sort-ændring)

**Nøgle-beslutninger:**
- Claude API kaldes udelukkende fra Cloud Functions (API-nøgle eksponeres aldrig i frontend)
- Gentagende påmindelser: appen opretter næste forekomst når brugeren markerer udført
- Have og hus deler samme `items`-collection — filtreres med `category`-feltet
- Begge garden-members modtager push-notifikationer som default (valgfrit pr. påmindelse via `notifyUsers[]`)

**Mappestruktur (`src/`):**
```
types/        – alle TypeScript-typer (Item, Reminder, Experience, Garden, User, CareAdvice)
services/     – firebase.ts, auth.ts, firestore.ts, push.ts
contexts/     – AuthContext.tsx, GardenContext.tsx
hooks/        – useItems.ts, useReminders.ts, useExperiences.ts
components/   – BottomNav, CategoryToggle, ItemCard, StatusBadge, forms/
pages/        – Home, Overview, ItemDetail, RemindersPage, Profile
```

**Cloud Functions (`functions/src/`):**
- `claude.ts` – HTTPS callable: `getItemAdvice(itemId)`
- `reminders.ts` – cron 08:00: `sendDailyReminders`
- `staleAdvice.ts` – cron dagligt: `markStaleAdvice` (sætter `isStale=true` efter 90 dage)

## Miljøvariabler

Firebase-config læses fra `.env` (se `.env.example`). Filen må aldrig committes.
