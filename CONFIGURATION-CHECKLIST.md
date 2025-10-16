# ⚙️ Configuration Checklist

Lista wszystkich plików i ustawień które musisz skonfigurować przed użyciem aplikacji.

## 🔴 WYMAGANE - bez tego aplikacja nie zadziała

### 1. Firebase Configuration

#### Plik: `app/src/firebase.ts`

**Status:** ⚠️ WYMAGA KONFIGURACJI

**Co zrobić:**
1. Stwórz projekt Firebase: https://console.firebase.google.com
2. Project Settings → Your apps → Web app
3. Skopiuj obiekt `firebaseConfig`
4. Wklej do `app/src/firebase.ts`

**Obecny stan:**
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← ZMIEŃ
  authDomain: "YOUR_PROJECT_ID...",    // ← ZMIEŃ
  projectId: "YOUR_PROJECT_ID",        // ← ZMIEŃ
  storageBucket: "YOUR_PROJECT_ID...", // ← ZMIEŃ
  messagingSenderId: "YOUR_...",       // ← ZMIEŃ
  appId: "YOUR_APP_ID"                 // ← ZMIEŃ
}
```

**Po konfiguracji:**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bibliotekarz-opery.firebaseapp.com",
  projectId: "bibliotekarz-opery",
  storageBucket: "bibliotekarz-opery.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}
```

---

#### Plik: `.firebaserc`

**Status:** ⚠️ WYMAGA KONFIGURACJI

**Co zrobić:**
Zmień `"your-project-id"` na prawdziwy ID projektu z Firebase.

**Obecny stan:**
```json
{
  "projects": {
    "default": "your-project-id"  // ← ZMIEŃ
  }
}
```

**Po konfiguracji:**
```json
{
  "projects": {
    "default": "bibliotekarz-opery"  // Twój project ID
  }
}
```

---

### 2. Firebase Services (Console)

**Co włączyć w Firebase Console:**

- [ ] **Authentication**
  - Settings → Sign-in method
  - Włącz: Email/Password
  
- [ ] **Firestore Database**
  - Create database
  - Location: europe-west3 (Frankfurt)
  - Mode: Production

- [ ] **Firebase Hosting**
  - Get started (automatycznie)

- [ ] **Cloud Functions** (opcjonalnie, dla emaili)
  - Upgrade do Blaze plan (darmowy w limitach)

---

### 3. Użytkownik (Bibliotekarz)

**Co zrobić:**
Stwórz konto bibliotekarza.

**Opcja A - Firebase Console:**
1. Authentication → Users
2. Add user
3. Email: `bibliotekarz@opera.pl`
4. Password: `TwojePewneHaslo123!`

**Opcja B - CLI:**
```bash
firebase auth:users:create bibliotekarz@opera.pl --password TwojePewneHaslo123!
```

---

## 🟡 WAŻNE - dla pełnej funkcjonalności

### 4. Ikony PWA

**Pliki do dodania w `app/public/`:**

- [ ] `pwa-192x192.png` (192x192 px)
- [ ] `pwa-512x512.png` (512x512 px)
- [ ] `apple-touch-icon.png` (180x180 px)
- [ ] `favicon.ico` (32x32 px)

**Jak stworzyć:**
Zobacz: `ICONS-README.md`

**Tymczasowo:**
Możesz użyć placeholder'ów z https://favicon.io/emoji-favicons/ (emoji 🎵)

---

### 5. Email (SendGrid/Resend)

**Status:** ⚠️ OPCJONALNE ale zalecane

**Co zrobić:**

1. **Stwórz konto SendGrid:**
   - https://sendgrid.com
   - Plan: Free (100 emails/day)

2. **Wygeneruj API Key:**
   - Dashboard → Settings → API Keys
   - Create API Key (Full Access)
   - Skopiuj klucz

3. **Skonfiguruj Firebase Functions:**
   ```bash
   firebase functions:config:set sendgrid.api_key="SG.xxxxx..."
   ```

4. **Odkomentuj kod email:**
   - Plik: `functions/src/index.ts`
   - Znajdź: `// TODO: Integracja z SendGrid/Resend`
   - Odkomentuj kod poniżej

5. **Zainstaluj SendGrid:**
   ```bash
   cd functions
   npm install @sendgrid/mail
   ```

6. **Zweryfikuj nadawcę:**
   - SendGrid → Settings → Sender Authentication
   - Verify Single Sender
   - Potwierdź email

7. **Zmień email nadawcy:**
   - Plik: `functions/src/index.ts`
   - Linia: `from: 'biblioteka@twoja-opera.pl'`
   - Zmień na zweryfikowany email

---

## 🟢 OPCJONALNE - nice to have

### 6. Własna domena

**Co zrobić:**
1. Kup domenę (np. `biblioteka-opery.pl`)
2. Firebase Console → Hosting → Add custom domain
3. Postępuj według instrukcji

**Koszt:** ~20-50 zł/rok (domena)

---

### 7. Google Analytics (opcjonalnie)

**Co zrobić:**
1. Firebase Console → Analytics
2. Enable Google Analytics
3. Kod automatycznie się zintegruje

---

## ✅ Checklist - Przed pierwszym uruchomieniem

- [ ] `app/src/firebase.ts` - wypełniony config
- [ ] `.firebaserc` - zaktualizowany project ID
- [ ] Firebase Console - Authentication włączony
- [ ] Firebase Console - Firestore Database stworzony
- [ ] Firebase Console - Użytkownik stworzony
- [ ] `npm install` w `app/`
- [ ] `npm install` w `functions/`
- [ ] Test build: `npm run build` w `app/`

---

## ✅ Checklist - Przed deployment na produkcję

- [ ] Wszystko z powyższej listy
- [ ] Ikony PWA dodane (4 pliki w `app/public/`)
- [ ] SendGrid skonfigurowany (jeśli chcesz emaile)
- [ ] Firebase Blaze plan (jeśli używasz Functions)
- [ ] Firestore rules deployed: `firebase deploy --only firestore:rules`
- [ ] Build działa: `npm run build` bez błędów
- [ ] Test lokalny: `npm run dev` - wszystko działa

---

## 📋 Komendy weryfikacyjne

Sprawdź czy wszystko działa:

```bash
# Czy Firebase CLI jest zainstalowany?
firebase --version

# Czy jesteś zalogowany?
firebase login

# Czy projekt jest połączony?
firebase projects:list

# Czy build działa?
cd app && npm run build

# Czy functions kompilują się?
cd ../functions && npm run build

# Czy wszystko gotowe do deploy?
cd .. && firebase deploy --dry-run
```

---

## 🆘 Co jeśli coś nie działa?

### Error: "Firebase not initialized"
→ Nie wypełniłeś `app/src/firebase.ts`

### Error: "Permission denied"
→ Nie deployed firestore.rules: `firebase deploy --only firestore:rules`

### Error: "Invalid credentials"
→ Nie stworzyłeś użytkownika w Authentication

### Error: "Module not found"
→ Nie zainstalowałeś zależności: `npm install`

### Warning: "Missing icon"
→ Nie dodałeś ikon PWA (działa, ale bez ikon)

---

## 📝 Szybki test - czy wszystko skonfigurowane?

```bash
# 1. Sprawdź Firebase config
cat app/src/firebase.ts | grep "YOUR_API_KEY"
# Jeśli widać "YOUR_API_KEY" = NIE skonfigurowane ❌

# 2. Sprawdź project ID
cat .firebaserc | grep "your-project-id"
# Jeśli widać "your-project-id" = NIE skonfigurowane ❌

# 3. Sprawdź ikony
ls -la app/public/*.png
# Jeśli brak plików = NIE dodane (opcjonalne) ⚠️

# 4. Test build
cd app && npm run build
# Jeśli ERROR = coś nie tak ❌
# Jeśli SUCCESS = gotowe! ✅
```

---

**Po wykonaniu wszystkich kroków aplikacja jest gotowa do użycia!** 🎉

Przejdź do: `QUICKSTART.md` lub `SETUP-GUIDE.md`

