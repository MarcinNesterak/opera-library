# 📁 Struktura projektu

```
Aplikacja bibliotekarza/
│
├── 📱 app/                          # Aplikacja React (Frontend)
│   ├── public/                      # Pliki statyczne
│   │   ├── manifest.json           # PWA manifest
│   │   ├── robots.txt              # SEO robots
│   │   ├── pwa-192x192.png        # ⚠️ DO DODANIA - ikona PWA
│   │   ├── pwa-512x512.png        # ⚠️ DO DODANIA - ikona PWA
│   │   ├── apple-touch-icon.png   # ⚠️ DO DODANIA - ikona iOS
│   │   └── favicon.ico            # ⚠️ DO DODANIA - favicon
│   │
│   ├── src/
│   │   ├── components/            # Komponenty React
│   │   │   ├── Layout.tsx         # Layout strony (wrapper)
│   │   │   └── Navigation.tsx     # Nawigacja górna
│   │   │
│   │   ├── contexts/              # React Context API
│   │   │   └── AuthContext.tsx    # Kontekst autentykacji
│   │   │
│   │   ├── pages/                 # Strony aplikacji
│   │   │   ├── Login.tsx          # Ekran logowania
│   │   │   ├── Dashboard.tsx      # Panel główny
│   │   │   ├── Musicians.tsx      # Zarządzanie muzykami
│   │   │   ├── Scores.tsx         # Zarządzanie nutami
│   │   │   ├── Loans.tsx          # Wypożyczenia
│   │   │   └── Settings.tsx       # Ustawienia
│   │   │
│   │   ├── App.tsx                # Główny komponent + routing
│   │   ├── main.tsx               # Entry point aplikacji
│   │   ├── index.css              # Globalne style (Tailwind)
│   │   ├── firebase.ts            # ⚠️ Konfiguracja Firebase
│   │   └── types.ts               # Typy TypeScript
│   │
│   ├── package.json               # Zależności frontendu
│   ├── tsconfig.json              # Config TypeScript
│   ├── vite.config.ts             # Config Vite + PWA
│   ├── tailwind.config.js         # Config Tailwind CSS
│   ├── postcss.config.js          # Config PostCSS
│   └── .eslintrc.cjs              # Config ESLint
│
├── ☁️ functions/                    # Cloud Functions (Backend)
│   ├── src/
│   │   └── index.ts               # Funkcje Firebase
│   │                              # - sendLoanNotification (email przy wypożyczeniu)
│   │                              # - sendDailyReminders (codzienne przypomnienia)
│   │
│   ├── package.json               # Zależności backendu
│   └── tsconfig.json              # Config TypeScript
│
├── 🔥 Firebase Config
│   ├── firebase.json              # Główna konfiguracja Firebase
│   ├── .firebaserc                # ⚠️ Projekt Firebase (do zaktualizowania)
│   ├── firestore.rules            # Zasady bezpieczeństwa Firestore
│   └── firestore.indexes.json     # Indeksy Firestore
│
├── 📚 Dokumentacja
│   ├── README.md                  # Główna dokumentacja
│   ├── SETUP-GUIDE.md             # Przewodnik krok po kroku
│   ├── QUICKSTART.md              # Szybki start
│   ├── TODO.md                    # Lista zadań do wykonania
│   ├── ICONS-README.md            # Jak dodać ikony PWA
│   └── PROJECT-STRUCTURE.md       # Ten plik
│
├── package.json                   # Root package.json (skrypty globalne)
└── .gitignore                     # Git ignore

```

## 🗂️ Baza danych Firestore (struktura)

```
📦 Firestore Database
│
├── 👥 musicians/                  # Kolekcja muzyków
│   └── {musicianId}/
│       ├── firstName: string
│       ├── lastName: string
│       ├── email: string
│       ├── phone?: string
│       ├── instrument: string
│       └── createdAt: timestamp
│
├── 🎵 scores/                     # Kolekcja nut
│   └── {scoreId}/
│       ├── title: string
│       ├── composer: string
│       ├── part: string           # np. "Trąbka 2"
│       ├── catalogNumber?: string
│       └── createdAt: timestamp
│
├── 📋 loans/                      # Kolekcja wypożyczeń
│   └── {loanId}/
│       ├── musicianId: string (ref)
│       ├── scoreId: string (ref)
│       ├── loanDate: timestamp
│       ├── returnDate: timestamp | null
│       ├── status: "active" | "returned"
│       ├── lastReminderSent?: timestamp
│       └── createdAt: timestamp
│
└── ⚙️ settings/                   # Ustawienia aplikacji
    └── app/
        ├── reminderIntervalDays: number
        └── emailEnabled: boolean
```

## 🔐 Firebase Authentication

```
Users Collection:
└── bibliotekarz@opera.pl (lub inny email)
    ├── Email/Password authentication
    └── Tylko 1 użytkownik (bibliotekarz)
```

## 🌐 Firebase Hosting

Hostuje zbudowaną aplikację z `app/dist/` na:
- `https://{project-id}.web.app`
- `https://{project-id}.firebaseapp.com`

Opcjonalnie własna domena (do skonfigurowania).

## ☁️ Cloud Functions

### sendLoanNotification
- **Trigger:** HTTP callable (wywoływana z frontendu)
- **Akcja:** Wysyła email przy wypożyczeniu/zwrocie
- **Parametry:** musicianEmail, scoreTitle, type (loan/return)

### sendDailyReminders
- **Trigger:** Scheduler (cron: codziennie o 8:00)
- **Akcja:** Sprawdza aktywne wypożyczenia i wysyła przypomnienia
- **Interwał:** Co X dni (z ustawień)

## 📦 Główne zależności

### Frontend (app/):
- **React** 18 - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Firebase SDK** - Backend integration
- **vite-plugin-pwa** - PWA support

### Backend (functions/):
- **firebase-functions** - Cloud Functions
- **firebase-admin** - Admin SDK
- **@sendgrid/mail** - Email (do zainstalowania)

## 🎨 Style i UI

- **Design system:** Tailwind CSS
- **Kolory:** Gray theme (profesjonalny, elegancki)
- **Responsywność:** Mobile-first approach
- **PWA:** Standalone app, offline support

## 🔒 Bezpieczeństwo

- **Firestore Rules:** Tylko zalogowani użytkownicy (bibliotekarz)
- **Cloud Functions:** Wymagają autentykacji
- **HTTPS:** Automatycznie przez Firebase Hosting
- **Environment:** Dane wrażliwe w Firebase Config

## 📱 PWA Features

- ✅ Manifest.json
- ✅ Service Worker (auto-generated przez vite-plugin-pwa)
- ✅ Offline support
- ✅ Installable (iOS + Android)
- ✅ Push notifications ready (do przyszłej implementacji)

## 🚀 Deployment Flow

```
1. Development:
   npm run dev (localhost:5173)

2. Build:
   npm run build (tworzy app/dist/)

3. Deploy:
   firebase deploy
   ├── Hosting: app/dist → web.app
   ├── Functions: functions/lib → Cloud Functions
   └── Rules: firestore.rules → Firestore

4. Live:
   https://{project-id}.web.app
```

## 📊 Workflow użycia

```
1. Bibliotekarz loguje się (web lub iPhone PWA)
   ↓
2. Dodaje muzyków (sekcja "Muzycy")
   ↓
3. Dodaje nuty (sekcja "Nuty")
   ↓
4. Tworzy wypożyczenie (sekcja "Wypożyczenia")
   ↓
5. System automatycznie:
   - Wysyła email do muzyka (potwierdzenie)
   - Codziennie sprawdza przypomnienia (Cloud Function)
   - Wysyła email co X dni (przypomnienie)
   ↓
6. Bibliotekarz oznacza jako zwrócone
   ↓
7. System wysyła email potwierdzenia zwrotu
```

## 🔄 Synchronizacja danych

- **Real-time:** Firestore synchronizuje dane automatycznie
- **Offline:** PWA cache'uje dane, synchronizuje po powrocie online
- **Multi-device:** Te same dane na komputerze i iPhone

## 📈 Skalowanie

Obecna architektura wspiera:
- ✅ Do 100 muzyków (wygodnie)
- ✅ Do 1000 utworów
- ✅ Do 5000 wypożyczeń rocznie
- ✅ Darmowy tier Firebase (wystarczy w 100%)

Przy większym ruchu:
- Firebase automatycznie skaluje
- Koszt ~$25-50/miesiąc przy bardzo dużym ruchu

---

**Ostatnia aktualizacja:** 16 października 2025
**Wersja:** 1.0.0

