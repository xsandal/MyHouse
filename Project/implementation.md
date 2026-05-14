# MyHouse – Implementationsplan

## Status

| Lag | Status |
|---|---|
| Types & data model | ✅ Færdig |
| Firebase setup | ✅ Færdig |
| Auth service | ✅ Færdig |
| Firestore service | ✅ Færdig |
| Storage service | ✅ Færdig |
| Push service | ✅ Færdig |
| React contexts (Auth, Garden) | ✅ Færdig |
| Hooks (useItems, useReminders, useExperiences) | ✅ Færdig |
| UI komponenter | ✅ Færdig |
| Sider / pages | ✅ Færdig |
| App routing (React Router) | ✅ Færdig |
| Cloud Functions | ✅ Færdig |
| Firebase service worker (push baggrund) | ✅ Færdig |
| Firestore regler deployed | ✅ Færdig |
| Firebase project linked (firebase use) | ✅ Færdig |
| Firebase Hosting deploy | ⏳ Mangler |

---

## Hvad der er bygget

### Foundation (`src/`)

- **`types/index.ts`** – Alle TypeScript-typer: `Item`, `Reminder`, `Experience`, `Garden`, `UserProfile`, `CareAdvice`. Inkl. hjælpefunktioner `getReminderStatus`, `getItemStatus`, `nextRecurringDate`.
- **`services/firebase.ts`** – Firebase app, auth, db, storage, functions (europe-west1).
- **`services/auth.ts`** – Google sign-in med automatisk oprettelse af brugerprofil i Firestore.
- **`services/firestore.ts`** – CRUD for gardens, items, reminders, experiences + `completeReminder` (med gentagelse) + `invalidateCareAdvice`.
- **`services/storage.ts`** – `uploadImage(path, file)` helper til Firebase Storage.
- **`services/push.ts`** – FCM token-registrering og push-permission flow.
- **`contexts/AuthContext.tsx`** – Firebase auth state med loading.
- **`contexts/GardenContext.tsx`** – Aktiv have + `category` toggle (garden/house).
- **`hooks/useItems.ts`** – Realtids-listener på items for aktiv have.
- **`hooks/useReminders.ts`** – `useReminders` (alle aktive for haven) + `useItemReminders` (pr. item).
- **`hooks/useExperiences.ts`** – Realtids-listener på experiences pr. item.

### Komponenter (`src/components/`)

- **`StatusBadge.tsx`** – Farvebadge: OK (grøn), Snart (amber), Forfalden (rød).
- **`CategoryToggle.tsx`** – Have/Hus-toggle der styrer `GardenContext.category`.
- **`ItemCard.tsx`** – 2-kolonne kort med billede/emoji, navn, undertekst, badge.
- **`BottomNav.tsx`** – Fast bundnavigation med 4 faner.
- **`forms/AddItemForm.tsx`** – Formular til plante (navn, type, sort, placering, billede), haveopgave (titel, beskrivelse, billede) og husopgave (titel, kategori, beskrivelse, billede). Plante/Opgave-toggle i have-tilstand. Bottom sheet modal.
- **`forms/EditItemForm.tsx`** – Redigér eksisterende item med pre-populerede felter. Invaliderer cachet Claude-rådgivning ved navn/sort-ændring.
- **`forms/AddReminderForm.tsx`** – Formular til påmindelser (titel, dato, gentagelse). Bottom sheet modal.
- **`forms/AddExperienceForm.tsx`** – Formular til erfaringer (tekst, billede). Bottom sheet modal.

### Sider (`src/pages/`)

- **`LoginPage.tsx`** – Google sign-in med logo.
- **`GardenSetup.tsx`** – Opret have / deltag med invite-kode.
- **`Home.tsx`** – Forside med havenavn, CategoryToggle, 6-item grid, 3 kommende påmindelser, FAB.
- **`Overview.tsx`** – Søgning, type-filter chips, gruppert liste, FAB.
- **`ItemDetail.tsx`** – Hero billede, 3 faner (Info, Erfaringer, Påmindelser), Claude AI-rådgivning via Firebase callable. Redigér-knap (✏️) + slet. Viser opgavefelter (beskrivelse, sidst udført) for haveopgaver.
- **`RemindersPage.tsx`** – Alle påmindelser grupperet: Forfaldne / Inden for 2 uger / Kommende.
- **`Profile.tsx`** – Brugerprofil, have-info, invite-kode (kopierbar), push-notifikationer toggle, log ud.

### Routing (`src/App.tsx`)

```
/ ikke logget ind    → LoginPage
/ logget ind, ingen have → GardenSetup
/                    → Home
/overview            → Overview
/items/:id           → ItemDetail
/reminders           → RemindersPage
/profile             → Profile
```

---

## Hvad der mangler

### 1. PWA-ikoner

`pwa-192x192.png` og `pwa-512x512.png` mangler i `public/`. Uden dem bygger appen men PWA-installationen er ufuldstændig.

### 2. Firebase Hosting deploy

```bash
npm run build
firebase deploy
```

Dette deployer på én gang: frontend (Hosting), regler (Firestore + Storage), indexes og Cloud Functions.

---

## Næste trin (anbefalet rækkefølge)

1. **Opret `.env`** fra `.env.example` og udfyld Firebase-config fra Firebase Console.
2. **Test lokalt**: `npm run dev` → verificér login + have-oprettelse.
3. **Gem Anthropic API-nøgle** som Firebase Secret:
   ```bash
   firebase functions:secrets:set ANTHROPIC_API_KEY
   ```
4. **Installer functions-afhængigheder**:
   ```bash
   cd functions && npm install
   ```
5. **Deploy alt på én gang**:
   ```bash
   npm run build
   firebase deploy
   ```
6. **Aktivér push-notifikationer** i appen (Profile-siden) for begge brugere.

---

## Cloud Functions – detaljer

| Funktion | Trigger | Beskrivelse |
|---|---|---|
| `getItemAdvice` | HTTPS Callable | Modtager `itemId`, bygger prompt med item + erfaringer, kalder Claude (`claude-sonnet-4-6`), cacher svar i `careAdvice/{itemId}`. Prompt-caching på system-prompt. |
| `sendDailyReminders` | Cron 08:00 CET | Finder påmindelser forfaldne i dag, grupperer pr. bruger og sender FCM push. Rydder op i ugyldige tokens. |
| `markStaleAdvice` | Cron 04:00 CET | Sætter `isStale=true` på `careAdvice`-docs ældre end 90 dage. |

## Service Worker

`public/firebase-messaging-sw.js` **genereres automatisk** fra `.env` når du kører `npm run dev` eller `npm run build` (via Vite-plugin i `vite.config.ts`). Filen er gitignored og indeholder Firebase-config (ikke en hemmelighed, men project-specifik).
