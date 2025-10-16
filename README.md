# 🎵 Bibliotekarz Opery

Aplikacja PWA (Progressive Web App) do zarządzania wypożyczeniami nut dla bibliotekarza operowego.

## 📋 Funkcje

- ✅ Zarządzanie muzykami (dodawanie, edycja, usuwanie, wyszukiwanie)
- ✅ Zarządzanie nutami (tytuł, kompozytor, głos/partia, numer katalogowy)
- ✅ System wypożyczeń z automatycznymi powiadomieniami email
- ✅ Przypomnienia co X dni dla muzyków z aktywnymi wypożyczeniami
- ✅ Panel główny z statystykami
- ✅ Responsywny design (desktop + mobile)
- ✅ PWA - działa jak aplikacja na iPhone i Android
- ✅ Offline support

## 🚀 Technologie

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore, Auth, Functions, Hosting)
- **Email:** SendGrid/Resend (do skonfigurowania)
- **PWA:** Service Workers, manifest.json

## 📱 Instalacja

### 1. Wymagania

- Node.js 18+ ([pobierz tutaj](https://nodejs.org/))
- npm (instaluje się z Node.js)
- Konto Firebase ([console.firebase.google.com](https://console.firebase.google.com))
- Konto SendGrid lub Resend (do emaili)

### 2. Konfiguracja Firebase

#### a) Stwórz projekt Firebase:
1. Wejdź na [console.firebase.google.com](https://console.firebase.google.com)
2. Kliknij "Add project" / "Dodaj projekt"
3. Nazwij projekt (np. "bibliotekarz-opery")
4. Wyłącz Google Analytics (opcjonalnie)
5. Stwórz projekt

#### b) Włącz usługi:

**Authentication:**
1. W menu bocznym: Authentication → Get started
2. Zakładka "Sign-in method"
3. Włącz "Email/Password"
4. Zapisz

**Firestore Database:**
1. W menu bocznym: Firestore Database → Create database
2. Wybierz region (najlepiej europe-west)
3. Start in **production mode** (zasady są w pliku firestore.rules)
4. Create

**Cloud Functions:**
- Automatycznie włączone (ale wymaga upgrade do Blaze plan - darmowy z limitami)

**Hosting:**
1. W menu bocznym: Hosting → Get started
2. Przejdź przez kroki

#### c) Pobierz konfigurację:
1. W Project Overview (koło zębate) → Project settings
2. Scrolluj w dół do "Your apps"
3. Kliknij ikonę web (</>)
4. Zarejestruj aplikację (nazwa: "Bibliotekarz Opery")
5. Skopiuj obiekt `firebaseConfig`

#### d) Wklej konfigurację do aplikacji:
Otwórz plik `app/src/firebase.ts` i zastąp wartości:

```typescript
const firebaseConfig = {
  apiKey: "AIza...",           // Skopiuj z Firebase Console
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

#### e) Zaktualizuj `.firebaserc`:
Otwórz `.firebaserc` i zmień `"your-project-id"` na prawdziwy ID projektu.

### 3. Instalacja zależności

```bash
# W głównym folderze projektu
cd "Aplikacja bibliotekarza"

# Zainstaluj zależności aplikacji webowej
cd app
npm install

# Zainstaluj zależności Cloud Functions
cd ../functions
npm install

# Wróć do głównego folderu
cd ..
```

### 4. Zainstaluj Firebase CLI

```bash
npm install -g firebase-tools
```

Zaloguj się do Firebase:

```bash
firebase login
```

### 5. Stwórz konto użytkownika (bibliotekarza)

Możesz to zrobić na dwa sposoby:

**Opcja A - przez Firebase Console:**
1. Firebase Console → Authentication → Users
2. Kliknij "Add user"
3. Wprowadź email i hasło
4. Add user

**Opcja B - przez kod (jednorazowo):**
Odkomentuj w `app/src/pages/Login.tsx` (na końcu pliku dodaj):
```typescript
// Do jednorazowego użycia - stwórz konto i zakomentuj
// createUserWithEmailAndPassword(auth, "bibliotekarz@opera.pl", "twoje-haslo")
```

## 🎯 Uruchomienie (development)

### Lokalne uruchomienie aplikacji:

```bash
cd app
npm run dev
```

Aplikacja będzie dostępna na: `http://localhost:5173`

### Testowanie Cloud Functions lokalnie:

```bash
cd functions
npm run serve
```

## 🌐 Deployment (produkcja)

### 1. Build aplikacji:

```bash
cd app
npm run build
```

### 2. Deploy wszystkiego na Firebase:

```bash
# W głównym folderze
firebase deploy
```

Lub osobno:

```bash
# Tylko hosting (aplikacja web)
firebase deploy --only hosting

# Tylko functions
firebase deploy --only functions

# Tylko firestore rules
firebase deploy --only firestore:rules
```

Po deploy aplikacja będzie dostępna na:
`https://your-project-id.web.app`

## 📧 Konfiguracja emaili (SendGrid)

### 1. Stwórz konto SendGrid:
- Wejdź na [sendgrid.com](https://sendgrid.com)
- Załóż darmowe konto (100 emaili/dzień)

### 2. Wygeneruj API Key:
1. SendGrid Dashboard → Settings → API Keys
2. Create API Key
3. Nazwij klucz (np. "Bibliotekarz Opery")
4. Full Access
5. Skopiuj klucz (schowaj bezpiecznie!)

### 3. Skonfiguruj Firebase Functions:

```bash
firebase functions:config:set sendgrid.api_key="SG.xxx..."
```

### 4. Odkomentuj kod email w `functions/src/index.ts`:

Znajdź sekcję z komentarzem `// TODO: Integracja z SendGrid/Resend` i odkomentuj kod.

### 5. Zainstaluj SendGrid w functions:

```bash
cd functions
npm install @sendgrid/mail
cd ..
```

### 6. Deploy functions ponownie:

```bash
firebase deploy --only functions
```

## 📱 Instalacja PWA na iPhone

### Dla bibliotekarza:

1. Otwórz Safari na iPhone
2. Wejdź na adres aplikacji (np. `https://your-project-id.web.app`)
3. Zaloguj się
4. Kliknij przycisk "Udostępnij" (ikona kwadratu ze strzałką)
5. Przewiń w dół i wybierz **"Dodaj do ekranu głównego"**
6. Nazwij aplikację (np. "Biblioteka")
7. Dodaj

Gotowe! Ikona aplikacji pojawi się na ekranie głównym iPhone i będzie działać jak natywna aplikacja.

## 🔧 Codzienne użytkowanie

### Logowanie:
- Web: `https://your-project-id.web.app`
- iPhone: Kliknij ikonę na ekranie głównym

### Workflow:

1. **Dodaj muzyków** (sekcja "Muzycy")
   - Imię, nazwisko, email, instrument

2. **Dodaj nuty** (sekcja "Nuty")
   - Tytuł, kompozytor, głos/partia

3. **Wypożycz nuty** (sekcja "Wypożyczenia")
   - Wybierz muzyka
   - Wybierz nuty
   - Kliknij "Dodaj wypożyczenie"
   - Muzyk automatycznie dostanie email

4. **Zwróć nuty**
   - W tabeli wypożyczeń kliknij "Oznacz jako zwrócone"
   - Muzyk dostanie potwierdzenie emailem

5. **Przypomnienia automatyczne**
   - Codziennie o 8:00 system sprawdza aktywne wypożyczenia
   - Jeśli minęło X dni (według ustawień), wysyła przypomnienie
   - Ustawienia → zmień interwał przypomnień

## 📊 Struktura projektu

```
Aplikacja bibliotekarza/
├── app/                    # Aplikacja React (frontend)
│   ├── src/
│   │   ├── components/    # Komponenty (Layout, Navigation)
│   │   ├── contexts/      # Context API (Auth)
│   │   ├── pages/         # Strony aplikacji
│   │   ├── firebase.ts    # Konfiguracja Firebase
│   │   ├── types.ts       # Typy TypeScript
│   │   └── main.tsx       # Entry point
│   ├── public/            # Pliki statyczne, ikony PWA
│   └── package.json
├── functions/             # Cloud Functions (backend)
│   ├── src/
│   │   └── index.ts      # Funkcje email + scheduler
│   └── package.json
├── firebase.json          # Konfiguracja Firebase
├── firestore.rules        # Zasady bezpieczeństwa Firestore
└── README.md
```

## 🆘 Troubleshooting

### Problem: "Firebase not configured"
- Sprawdź czy wypełniłeś `app/src/firebase.ts` danymi z Firebase Console

### Problem: Nie wysyłają się emaile
- Sprawdź czy skonfigurowałeś SendGrid API key
- Sprawdź czy odkomentowałeś kod email w `functions/src/index.ts`
- Sprawdź logi: `firebase functions:log`

### Problem: Nie mogę się zalogować
- Sprawdź czy stworzyłeś użytkownika w Firebase Authentication
- Sprawdź czy włączyłeś Email/Password w Authentication

### Problem: PWA nie działa offline
- PWA wymaga HTTPS (Firebase Hosting dostarcza to automatycznie)
- Na localhost może nie działać - testuj na deployed wersji

## 📝 Roadmap / Przyszłe funkcje

- [ ] Export listy wypożyczeń do Excel/PDF
- [ ] Statystyki zaawansowane (najpopularniejsze utwory, muzycy)
- [ ] Historia wypożyczeń dla każdego muzyka
- [ ] Dark mode
- [ ] Własna domena (zamiast .web.app)

## 📄 Licencja

Prywatny projekt.

## 👨‍💻 Autor

Marcin - Bibliotekarz Opery

---

**Pytania?** Sprawdź [dokumentację Firebase](https://firebase.google.com/docs) lub [dokumentację React](https://react.dev/)

