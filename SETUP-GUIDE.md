# 🚀 Szybki start - Przewodnik krok po kroku

Ten dokument przeprowadzi Cię przez cały proces uruchomienia aplikacji od zera do działającej wersji.

## ✅ Checklist

- [ ] Konto Firebase założone
- [ ] Projekt Firebase stworzony
- [ ] Node.js zainstalowany
- [ ] Zależności zainstalowane
- [ ] Firebase skonfigurowany
- [ ] Użytkownik (bibliotekarz) stworzony
- [ ] Aplikacja uruchomiona lokalnie
- [ ] Aplikacja wdrożona na Firebase Hosting
- [ ] SendGrid skonfigurowany (opcjonalnie)
- [ ] PWA zainstalowana na iPhone

## 1️⃣ Instalacja Node.js (jeśli nie masz)

### Mac:
```bash
# Sprawdź czy masz Node.js
node --version

# Jeśli nie masz, zainstaluj przez Homebrew:
brew install node

# Lub pobierz z: https://nodejs.org/
```

### Weryfikacja:
```bash
node --version  # Powinno pokazać v18.x.x lub wyżej
npm --version   # Powinno pokazać 9.x.x lub wyżej
```

## 2️⃣ Firebase - Konfiguracja krok po kroku

### Krok 1: Stwórz projekt Firebase

1. Otwórz przeglądarkę
2. Wejdź na: https://console.firebase.google.com
3. Kliknij **"Add project"** (lub "Dodaj projekt")
4. Nazwa projektu: `bibliotekarz-opery` (lub dowolna)
5. Google Analytics: **Wyłącz** (nie potrzebujemy)
6. Kliknij **"Create project"**
7. Poczekaj ~30 sekund
8. Kliknij **"Continue"**

### Krok 2: Włącz Authentication

1. W menu po lewej stronie: **Authentication**
2. Kliknij **"Get started"**
3. Zakładka: **"Sign-in method"**
4. Znajdź **"Email/Password"**
5. Kliknij na niego
6. Włącz pierwszy przełącznik (**Enable**)
7. Kliknij **"Save"**

### Krok 3: Stwórz Firestore Database

1. W menu po lewej: **Firestore Database**
2. Kliknij **"Create database"**
3. **Location**: wybierz `europe-west3` (Frankfurt) - najbliżej Polski
4. **Secure rules**: wybierz **"Start in production mode"**
5. Kliknij **"Create"**
6. Poczekaj ~1 minutę

### Krok 4: Pobierz konfigurację Firebase

1. Kliknij ikonę **koła zębatego** (⚙️) obok "Project Overview"
2. Wybierz **"Project settings"**
3. Scrolluj w dół do sekcji **"Your apps"**
4. Kliknij ikonę **Web** (`</>`)
5. Nickname: `Bibliotekarz Opery`
6. ❌ NIE zaznaczaj "Firebase Hosting"
7. Kliknij **"Register app"**
8. Skopiuj cały obiekt `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bibliotekarz-opery.firebaseapp.com",
  projectId: "bibliotekarz-opery",
  storageBucket: "bibliotekarz-opery.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

9. Kliknij **"Continue to console"**

### Krok 5: Wklej konfigurację do aplikacji

1. Otwórz projekt w edytorze kodu (VS Code, Cursor, etc.)
2. Znajdź plik: `app/src/firebase.ts`
3. Zastąp wartości w `firebaseConfig`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXX...",              // ← Wklej swoje wartości
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
}
```

4. Zapisz plik (⌘+S / Ctrl+S)

### Krok 6: Zaktualizuj .firebaserc

1. Otwórz plik: `.firebaserc`
2. Zmień `"your-project-id"` na Twój **projectId** z Firebase:

```json
{
  "projects": {
    "default": "bibliotekarz-opery"
  }
}
```

3. Zapisz

## 3️⃣ Instalacja zależności

Otwórz terminal i wykonaj:

```bash
# Przejdź do folderu projektu
cd "/Users/marcin/Documents/Aplikacja bibliotekarza"

# Zainstaluj zależności aplikacji webowej
cd app
npm install

# To zajmie ~2-3 minuty
# Poczekaj aż się zakończy

# Zainstaluj zależności Cloud Functions
cd ../functions
npm install

# Wróć do głównego folderu
cd ..
```

## 4️⃣ Zainstaluj Firebase CLI

```bash
# Zainstaluj globalnie
npm install -g firebase-tools

# Zaloguj się do Firebase
firebase login

# Otworzy się przeglądarka - zaloguj się tym samym kontem Google
# Po zalogowaniu wróć do terminala
```

Weryfikacja:
```bash
firebase projects:list
# Powinno pokazać Twój projekt
```

## 5️⃣ Stwórz konto użytkownika (bibliotekarza)

### Opcja A - przez Firebase Console (łatwiejsza):

1. Firebase Console → **Authentication** → **Users**
2. Kliknij **"Add user"**
3. Email: `bibliotekarz@opera.pl` (lub swój email)
4. Password: `TwojeHaslo123!` (zapamiętaj!)
5. Kliknij **"Add user"**

### Opcja B - przez konsole:

```bash
firebase auth:users:create bibliotekarz@opera.pl --password TwojeHaslo123!
```

## 6️⃣ Uruchom aplikację lokalnie

```bash
# W folderze projektu
cd app
npm run dev
```

W przeglądarce otwórz: **http://localhost:5173**

Powinieneś zobaczyć ekran logowania! 🎉

**Zaloguj się:**
- Email: `bibliotekarz@opera.pl`
- Password: `TwojeHaslo123!`

## 7️⃣ Deploy na Firebase (produkcja)

### Krok 1: Build aplikacji

```bash
cd app
npm run build
```

### Krok 2: Deploy Firestore Rules

```bash
cd ..
firebase deploy --only firestore:rules
```

### Krok 3: Deploy Functions

```bash
firebase deploy --only functions
```

**Ważne:** Firebase poprosi o upgrade do **Blaze plan**. To nadal darmowy plan, ale wymaga karty kredytowej. Limity darmowe wystarczą na Twoje potrzeby.

### Krok 4: Deploy Hosting (aplikacja web)

```bash
firebase deploy --only hosting
```

Po zakończeniu zobaczysz URL:
```
✔  Deploy complete!

Hosting URL: https://bibliotekarz-opery.web.app
```

Otwórz ten URL w przeglądarce - Twoja aplikacja działa! 🚀

## 8️⃣ Instalacja PWA na iPhone

1. Otwórz **Safari** na iPhone
2. Wejdź na URL z poprzedniego kroku
3. Zaloguj się
4. Kliknij przycisk **"Udostępnij"** (kwadrat ze strzałką) na dole
5. Scrolluj w dół
6. Wybierz **"Dodaj do ekranu głównego"**
7. Nazwa: `Biblioteka` (lub dowolna)
8. Kliknij **"Dodaj"**

Gotowe! Ikona pojawi się na ekranie głównym iPhone.

## 9️⃣ Konfiguracja emaili (SendGrid) - OPCJONALNIE

### Jeśli chcesz, aby emaile naprawdę się wysyłały:

1. Wejdź na: https://sendgrid.com
2. Kliknij **"Start for free"**
3. Załóż konto (potwierdź email)
4. Dashboard → Settings → **API Keys**
5. Kliknij **"Create API Key"**
6. Nazwa: `Bibliotekarz`
7. **Full Access**
8. Kliknij **"Create & View"**
9. **Skopiuj klucz** (WAŻNE - nie zobaczysz go ponownie!)

### Konfiguracja w Firebase:

```bash
firebase functions:config:set sendgrid.api_key="SG.xxxxxxxxx"
```

### Odkomentuj kod w functions:

1. Otwórz: `functions/src/index.ts`
2. Znajdź komentarz: `// TODO: Integracja z SendGrid/Resend`
3. Odkomentuj cały kod poniżej
4. Zapisz

### Zainstaluj SendGrid:

```bash
cd functions
npm install @sendgrid/mail
npm run build
cd ..
```

### Deploy ponownie:

```bash
firebase deploy --only functions
```

### Zweryfikuj email nadawcy w SendGrid:

1. SendGrid Dashboard → Settings → **Sender Authentication**
2. **Verify a Single Sender**
3. Wypełnij formularz
4. Potwierdź email

Teraz emaile będą się wysyłać! 📧

## 🎉 Gotowe!

Masz:
- ✅ Działającą aplikację webową
- ✅ Aplikację mobilną (PWA) na iPhone
- ✅ Backend w chmurze (Firebase)
- ✅ Automatyczne backupy
- ✅ Darmowy hosting

## 📝 Codzienne użytkowanie

1. **Desktop:** Otwórz przeglądarkę → wejdź na URL
2. **iPhone:** Kliknij ikonę na ekranie głównym
3. Zaloguj się
4. Dodaj muzyków, nuty, wypożyczenia

## 🆘 Pomoc

### Problem: "Firebase not initialized"
→ Sprawdź czy wypełniłeś `app/src/firebase.ts`

### Problem: "Permission denied"
→ Deploy firestore rules: `firebase deploy --only firestore:rules`

### Problem: Nie działa funkcja emaili
→ Sprawdź czy upgrade'owałeś do Blaze plan

### Problem: PWA nie instaluje się
→ Musi być HTTPS (Firebase Hosting automatycznie)

## 📚 Następne kroki

1. Dodaj kilku muzyków testowych
2. Dodaj kilka utworów
3. Przetestuj wypożyczenie
4. Sprawdź czy email działa (jeśli skonfigurowałeś SendGrid)
5. Zainstaluj na iPhone

---

**Powodzenia! 🎵**

