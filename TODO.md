# ✅ TODO List - Co jeszcze zrobić

## 🔴 Krytyczne (przed użyciem produkcyjnym)

- [ ] **Skonfiguruj Firebase:**
  - [ ] Stwórz projekt Firebase
  - [ ] Włącz Authentication (Email/Password)
  - [ ] Stwórz Firestore Database
  - [ ] Pobierz config i wklej do `app/src/firebase.ts`
  - [ ] Zaktualizuj `.firebaserc` z project ID

- [ ] **Stwórz użytkownika (bibliotekarza):**
  - [ ] Firebase Console → Authentication → Add user

- [ ] **Dodaj ikony PWA:**
  - [ ] Wygeneruj ikony (patrz: `ICONS-README.md`)
  - [ ] Umieść w `app/public/`

- [ ] **Deploy aplikacji:**
  - [ ] `npm run build`
  - [ ] `firebase deploy`

## 🟡 Ważne (dla pełnej funkcjonalności)

- [ ] **Konfiguracja emaili:**
  - [ ] Konto SendGrid/Resend
  - [ ] API Key
  - [ ] `firebase functions:config:set sendgrid.api_key="..."`
  - [ ] Odkomentuj kod email w `functions/src/index.ts`
  - [ ] `npm install @sendgrid/mail` w functions/
  - [ ] Deploy functions

- [ ] **Upgrade Firebase do Blaze plan:**
  - [ ] Potrzebne dla Cloud Functions
  - [ ] Nadal darmowy (w limitach)
  - [ ] Wymaga karty kredytowej

- [ ] **Testowanie:**
  - [ ] Dodaj kilku muzyków testowych
  - [ ] Dodaj kilka utworów
  - [ ] Przetestuj wypożyczenie
  - [ ] Sprawdź czy emaile działają
  - [ ] Zainstaluj PWA na iPhone i przetestuj

## 🟢 Opcjonalne (nice to have)

- [ ] **GitHub (BARDZO ZALECANE!):**
  - [ ] Stwórz konto GitHub
  - [ ] Stwórz repozytorium
  - [ ] Push kodu (backup + historia zmian)
  - [ ] Zobacz: GITHUB-SETUP.md

- [ ] **Własna domena:**
  - [ ] Kup domenę (np. `biblioteka-opery.pl`)
  - [ ] Skonfiguruj w Firebase Hosting

- [ ] **Profesjonalne ikony:**
  - [ ] Zatrudnij designera lub
  - [ ] Zaprojektuj w Figma/Canva

- [ ] **Backup strategy:**
  - [ ] Export danych Firestore (przez Firebase Console)
  - [ ] Regularny backup co miesiąc

- [ ] **Monitorowanie:**
  - [ ] Włącz Google Analytics (opcjonalnie)
  - [ ] Sprawdzaj logi funkcji: `firebase functions:log`

- [ ] **Bezpieczeństwo:**
  - [ ] Skonfiguruj bardziej szczegółowe Firestore rules
  - [ ] Dodaj rate limiting dla Cloud Functions

## 🔵 Przyszłe funkcje (roadmap)

- [ ] Export wypożyczeń do Excel/PDF
- [ ] Statystyki zaawansowane
- [ ] Historia wypożyczeń per muzyk
- [ ] Dark mode
- [ ] Wiele bibliotek/orkiestr
- [ ] Kalendarz wypożyczeń
- [ ] Skanowanie QR/kodów kreskowych
- [ ] Aplikacja natywna (React Native) zamiast PWA

## 📝 Notatki

### Aktualna wersja: 1.0.0

### Data stworzenia projektu:
16 października 2025

### Stack technologiczny:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Firebase (Firestore, Auth, Functions, Hosting)
- Email: SendGrid/Resend (do skonfigurowania)
- PWA: vite-plugin-pwa

### Linki:
- Firebase Console: https://console.firebase.google.com
- SendGrid: https://sendgrid.com
- Dokumentacja: README.md

---

**Wskazówka:** Zacznij od sekcji 🔴 Krytyczne, potem przejdź do 🟡 Ważne.

