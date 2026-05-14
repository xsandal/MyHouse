# Haveapp – Teknisk arkitekturbeskrivelse

## Overblik

Haveappen er en personlig digital haveassistent til to brugere (dig og din kæreste). Den giver jer mulighed for at registrere planter, buske og træer i jeres have, modtage plejeinformation og blive påmindet om sæsonbaserede opgaver som gødning og beskæring.

---

## Delelementer

### 1. Brugere og profiler

Hver bruger har sin egen profil tilknyttet en Google-konto. Begge profiler er koblet til den samme have, så I deler planter, noter og påmindelser. Det er muligt at se hvem der har tilføjet eller ændret noget.

- Platform: Android, Chrome
- Login: Google-konto via Firebase Authentication
- Delt have via et `members`-array i databasen

---

### 2. PWA – Progressive Web App

Selve appen er bygget som en Progressive Web App. Det betyder at den er bygget som en hjemmeside, men opfører sig som en rigtig app.

**Fordele:**
- Installerbar direkte fra Chrome – ingen app store
- Fungerer offline (vigtigt ude i haven)
- Én version at vedligeholde
- Kan sende push-notifikationer på Android

**Teknologi:**
- React + Vite
- Tailwind CSS til styling
- Vite PWA Plugin til offline-support og installation

---

### 3. Firebase – sky-fundament

Firebase er Googles platform der håndterer login, database og fillagring. Den sørger automatisk for realtidssynkronisering mellem jeres to telefoner.

**Firebase Authentication**
- Login med Google-konto
- Håndterer sessions og sikkerhed automatisk

**Firebase Firestore**
- Databasen der gemmer alle data: planter, noter, påmindelser og cachet plejeinformation
- Realtidssynkronisering – ændringer hos den ene vises øjeblikkeligt hos den anden

**Firebase Storage**
- Gemmer billeder af planter og placeringer i haven

**Pris:** Gratis-niveauet (Spark plan) dækker mere end rigeligt til to brugere.

---

### 4. Claude API – intelligent plejeinformation

Når I vil have råd om en plante, sender appen en forespørgsel til Claude API med plantens navn, sort og jeres egne noter. Svaret indeholder konkret information om pasning, beskæring, gødning og sæsonrytme.

**Caching:**
- Svar gemmes i Firestore og genbruges i op til 90 dage
- En "Opdatér"-knap giver mulighed for manuelt at hente nyt svar
- Forældet information markeres automatisk efter 90 dage

**Pris:** Betaling pr. brug. Ved normal brug for to personer forventes omkostningen at være under 1–2 USD pr. måned.

---

### 5. Cloud Functions – baggrundsjobs

En lille smule kode kører automatisk én gang om dagen på Googles servere uden at I behøver gøre noget.

**Opgaver:**
- Tjekker dagligt om der er påmindelser der skal sendes
- Afsender notifikationer via Web Push
- Markerer plejeinformation som forældet efter 90 dage

**Teknologi:** Firebase Cloud Functions (Node.js)

---

### 6. Web Push – påmindelser

Notifikationer (f.eks. "Nu er det tid til at gøde dine rosenbuske") sendes direkte til jeres Android-telefoner via Web Push – også når appen ikke er åben.

- I giver én gang tilladelse til notifikationer i Chrome
- Cloud Functions afsender dem automatisk på det rette tidspunkt
- Understøttet i Android Chrome

---

## Datastruktur (Firestore)

```
users/{userId}
  - email
  - displayName
  - gardenIds[]

gardens/{gardenId}
  - members[]         // [userId, userId]
  - inviteCode        // kort kode til at joine haven, f.eks. "ROSE42"
  - name

plants/{plantId}
  - gardenId
  - name              // f.eks. "Æbletræ"
  - type              // tree | shrub | plant | bulb | other
  - variety           // f.eks. "Cox Orange" (valgfrit)
  - locationText      // fritekst, f.eks. "Bag hækken mod syd"
  - locationImageUrl  // valgfrit foto af placeringen
  - imageUrl          // hovedbillede af planten
  - addedBy
  - addedAt
  - notes

reminders/{reminderId}
  - plantId
  - gardenId
  - title             // f.eks. "Gød rosenbuske"
  - dueDate
  - recurring         // none | weekly | monthly | yearly
  - completed
  - completedAt
  - createdBy

experiences/{experienceId}
  - plantId
  - gardenId
  - text              // f.eks. "Beskåret hårdt – kom sig fint"
  - imageUrl          // valgfrit
  - date
  - createdBy

careAdvice/{plantId}
  - cachedAdvice      // svar fra Claude API
  - generatedAt
  - isStale           // true efter 90 dage
  - plantName
  - variety
```

---

## Teknisk stack – oversigt

| Komponent | Teknologi |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| PWA | Vite PWA Plugin |
| Database | Firebase Firestore |
| Login | Firebase Authentication |
| Billedlagring | Firebase Storage |
| Baggrundsjobs | Firebase Cloud Functions |
| Notifikationer | Web Push |
| AI-rådgivning | Claude API (claude-sonnet-4-20250514) |

---

## Økonomi

| Komponent | Pris |
|---|---|
| Firebase (Spark plan) | Gratis |
| React, Vite, Tailwind | Gratis (open source) |
| Web Push | Gratis |
| Claude API (app-brug) | ~1–2 USD/måned ved normal brug |

---

## MVP – første version

1. Tilføj plante/busk/træ med navn, sort, placering og billede
2. Se plejeinformation for planten (via Claude API med caching)
3. Sæsonbaserede påmindelser (gødning, beskæring osv.)
4. Egne noter og erfaringer pr. plante
5. Simpel have-oversigt med alle registrerede planter

---

## UI-beskrivelse

Appen er designet til brug på Android i Chrome. Alt UI bygges i React med Tailwind CSS. Layoutet er mobilfirst og optimeret til tommelfinger-navigation.

---

### Navigation

Appen bruger en fast bundnavigation med fire faner der altid er synlige:

| Fane | Ikon | Indhold |
|---|---|---|
| Hjem | 🏡 | Forsiden med overblik over have og hus |
| Oversigt | 📋 | Fuld liste over alle objekter (planter / husopgaver) |
| Påmindelser | 🔔 | Alle kommende og forfaldne påmindelser |
| Profil | 👤 | Brugerprofil, have-indstillinger og invite-kode |

---

### Skærm 1 – Forside (Hjem)

Forsiden giver et hurtigt overblik over hvad der kræver opmærksomhed.

**Øverst:**
- Titel: "Vores have" (eller havenavn)
- Undertitel: antal registrerede objekter
- Brugerens initialer som avatar (øverst højre)

**Indhold:**
- Sektion "Have" med toggle til "Hus" (se afsnit om Have/Hus-toggle)
- Kortgrid (2 kolonner) med de senest tilføjede eller mest relevante planter
- Hvert kort viser: billede/emoji, navn, type og et status-badge (se badges)
- Sektion "Kommende påmindelser" med de næste 2–3 opgaver som listeformat

**Handling:**
- Tryk på kort → åbner plantesiden (Skærm 3)
- Tryk på påmindelsesrække → åbner den relevante plante/opgave

---

### Skærm 2 – Oversigt (liste over alle objekter)

Viser alle registrerede planter eller husopgaver afhængigt af aktiv toggle.

**Øverst:**
- Søgefelt med live-filtrering på navn og placering
- Filterkategorier som chips: Alle / Træer / Buske / Planter (for have) eller relevante kategorier for hus

**Liste:**
- Grupperet efter type med en sektionslabel (f.eks. "Træer", "Buske")
- Hver række viser: farvet ikon-firkant, navn, sort + placering som undertekst, status-badge
- Tryk på række → åbner objekt-siden (Skærm 3)

**Nederst:**
- Stor knap: "+ Tilføj plante" (grøn) eller "+ Tilføj opgave" (blå) afhængigt af aktiv toggle

---

### Skærm 3 – Objektside (plante eller husopgave)

Detaljeside for et enkelt objekt. Øverst vises et hero-billede (eller farvet placeholder med emoji). Nedenunder er tre faner:

**Fane 1 – Plejeinformation / Beskrivelse**
- Navn, sort og placering
- Type-tags som pills
- AI-genereret rådgivningsboks (grøn baggrund for have, blå for hus)
- Sidst opdateret-dato + "Opdatér"-knap til at hente nyt svar fra Claude API

**Fane 2 – Noter**
- Kronologisk liste over erfaringer og noter tilføjet af begge brugere
- Hver note viser: tekst, dato og hvem der tilføjede den
- Knap: "+ Tilføj erfaring"

**Fane 3 – Påmindelser**
- Liste over påmindelser knyttet til dette objekt
- Hver viser: titel, dato/frekvens og farveprik for status
- Knap: "+ Tilføj påmindelse"

**Bundlinje:**
- Tilbage-knap (venstre)
- Rediger-knap (højre)

---

### Have/Hus-toggle

En central del af UI'et er muligheden for at skifte mellem Have og Hus. Togglen placeres øverst på både Forsiden og Oversigtssiden.

```
[ 🌿 Have ]  [ 🏠 Hus ]
```

- Aktiv tilstand Have: grøn baggrund (#E1F5EE), mørk grøn tekst
- Aktiv tilstand Hus: blå baggrund (#E6F1FB), mørk blå tekst
- Skifter indholdet på siden uden at navigere – blot et state-skift i React

Implementeres som en `category`-prop på alle objekter i Firestore: `garden` eller `house`. Alle skærme filtrerer på denne prop baseret på aktiv toggle-tilstand.

---

### Status-badges

Bruges på kort og listerækker til hurtigt at signalere objektets tilstand:

| Badge | Farve | Betydning |
|---|---|---|
| OK | Grøn (#EAF3DE / #27500A) | Ingen opgaver |
| Snart | Amber (#FAEEDA / #633806) | Opgave inden for ~2 uger |
| Forfalden | Rød (#FCEBEB / #791F1F) | Opgave overskredet |
| Beskær snart | Amber | Specifik opgavetype |

---

### Farvepalette

Appen bruger to primærfarver der adskiller have og hus visuelt:

| Kontekst | Primærfarve | Baggrund | Tekst |
|---|---|---|---|
| Have | Grøn | #E1F5EE | #085041 |
| Hus | Blå | #E6F1FB | #0C447C |
| Handling/CTA | Grøn knap | #1D9E75 | hvid |
| Hus CTA | Blå knap | #378ADD | hvid |

Neutrale overflader bruger Tailwinds standard grå-skala via CSS-variabler (`--color-background-primary`, `--color-background-secondary`).

---

### Formularer – tilføj objekt

Når brugeren trykker "+ Tilføj plante" eller "+ Tilføj opgave" vises en formular (ny skærm eller bottom sheet).

**Plante-formular:**
- Navn (tekst, påkrævet)
- Type: Træ / Busk / Plante / Løg / Andet (vælg én)
- Sort (tekst, valgfrit)
- Placering – fritekst (f.eks. "Bag hækken mod syd")
- Placeringsbillede – upload fra kamera eller galleri (valgfrit)
- Hovedbillede af planten – upload (valgfrit)
- Gem-knap

**Husopgave-formular:**
- Titel (tekst, påkrævet)
- Kategori: Træværk / Vinduer / Terrasse / Fundament / Andet
- Beskrivelse (fritekst, valgfrit)
- Sidst udført (dato, valgfrit)
- Billede – upload (valgfrit)
- Gem-knap

---

### Påmindelses-formular

Tilgås fra Fane 3 på objektsiden eller fra Påmindelses-fanen i bundnavigationen.

- Titel (tekst, f.eks. "Gød rosenbuske")
- Dato for næste udførelse (datovælger)
- Gentagelse: Ingen / Ugentlig / Månedlig / Årlig
- Gem-knap
