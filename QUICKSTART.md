# ⚡ Quick Start - Szybkie uruchomienie

## 🎯 Dla niecierpliwych - uruchom w 5 minut

### 1. Zainstaluj Firebase CLI (jeśli nie masz)

```bash
npm install -g firebase-tools
firebase login
```

### 2. Skonfiguruj Firebase

```bash
# Stwórz projekt na: https://console.firebase.google.com
# Włącz: Authentication (Email/Password), Firestore Database

# Pobierz config z Firebase Console i wklej do:
# app/src/firebase.ts
```

### 3. Aktualizuj .firebaserc

```bash
# Zmień "your-project-id" na swój project ID z Firebase
```

### 4. Uruchom lokalnie

```bash
cd app
npm run dev
```

Otwórz: **http://localhost:5173**

### 5. Stwórz użytkownika

W Firebase Console → Authentication → Add user

Email: `admin@opera.pl`
Password: `TwojeHaslo123!`

### 6. Zaloguj się

Gotowe! 🎉

---

## 📦 Deploy na produkcję

```bash
# Build
cd app
npm run build
cd ..

# Deploy wszystko
firebase deploy

# LUB osobno:
firebase deploy --only hosting      # tylko aplikacja web
firebase deploy --only functions    # tylko cloud functions
firebase deploy --only firestore:rules  # tylko zasady bazy
```

Twoja aplikacja będzie na: `https://your-project-id.web.app`

---

## 📱 Instalacja na iPhone

1. Otwórz Safari → URL aplikacji
2. "Udostępnij" → "Dodaj do ekranu głównego"
3. Gotowe!

---

## 🔧 Najczęstsze komendy

```bash
# Development
npm run dev              # Uruchom lokalnie
npm run build            # Zbuduj produkcję
npm run deploy           # Deploy wszystko
npm run logs             # Pokaż logi funkcji

# W folderze app/
npm run dev              # Development server
npm run build            # Build produkcji
npm run preview          # Preview buildu

# W folderze functions/
npm run build            # Kompiluj functions
npm run serve            # Testuj lokalnie
```

---

## 📧 Emaile (opcjonalnie)

### SendGrid (darmowe 100/dzień):

1. Konto: https://sendgrid.com
2. API Key: Dashboard → Settings → API Keys
3. Konfiguruj:
   ```bash
   firebase functions:config:set sendgrid.api_key="SG.xxx"
   ```
4. Odkomentuj kod w `functions/src/index.ts`
5. Zainstaluj:
   ```bash
   cd functions
   npm install @sendgrid/mail
   ```
6. Deploy:
   ```bash
   firebase deploy --only functions
   ```

---

## 🆘 Problemy?

| Problem | Rozwiązanie |
|---------|-------------|
| Firebase not configured | Wypełnij `app/src/firebase.ts` |
| Permission denied | `firebase deploy --only firestore:rules` |
| Can't login | Stwórz usera w Firebase Console |
| PWA nie instaluje się | Musi być HTTPS (Firebase daje to auto) |

---

## 📚 Pełna dokumentacja

- **Setup od zera:** `SETUP-GUIDE.md`
- **Główny README:** `README.md`
- **Ikony PWA:** `ICONS-README.md`

---

**Powodzenia! 🎵**

