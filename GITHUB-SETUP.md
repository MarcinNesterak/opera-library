# 🐙 GitHub Setup - Przewodnik

## Dlaczego GitHub?

✅ **Backup automatyczny** - kod zawsze bezpieczny
✅ **Historia zmian** - możesz cofnąć każdą zmianę
✅ **Współpraca** - łatwo współpracować z innymi
✅ **CI/CD** - automatyczne deploymenty
✅ **Portfolio** - pokaz swojej pracy

---

## 🚀 Setup krok po kroku

### Krok 1: Stwórz konto GitHub (jeśli nie masz)

1. Wejdź na: https://github.com
2. Kliknij **Sign up**
3. Załóż konto (darmowe)

### Krok 2: Zainstaluj Git (jeśli nie masz)

**macOS:**
```bash
# Sprawdź czy masz:
git --version

# Jeśli nie masz, zainstaluj przez Xcode Command Line Tools:
xcode-select --install

# LUB przez Homebrew:
brew install git
```

**Konfiguracja Git (jednorazowo):**
```bash
git config --global user.name "Twoje Imię"
git config --global user.email "twoj@email.pl"
```

### Krok 3: Stwórz repozytorium na GitHub

1. Zaloguj się na GitHub
2. Kliknij **+** (prawy górny róg) → **New repository**
3. Nazwa: `bibliotekarz-opery` (lub inna)
4. Opis: `Aplikacja do zarządzania wypożyczeniami nut w operze`
5. **Private** lub **Public** (wybierz Private dla prywatnego projektu)
6. ❌ **NIE** zaznaczaj "Initialize with README" (masz już pliki)
7. Kliknij **Create repository**

### Krok 4: Podłącz lokalny projekt do GitHub

**W terminalu, w folderze projektu:**

```bash
cd "/Users/marcin/Documents/Aplikacja bibliotekarza"

# Zainicjalizuj Git (jeśli jeszcze nie jest)
git init

# Dodaj wszystkie pliki
git add .

# Pierwszy commit
git commit -m "Initial commit - Bibliotekarz Opery v1.0.0"

# Dodaj remote (zmień URL na swój z GitHub)
git remote add origin https://github.com/TWOJA-NAZWA/bibliotekarz-opery.git

# Wypchnij do GitHub
git branch -M main
git push -u origin main
```

**Gotowe!** Kod jest teraz na GitHubie! 🎉

---

## 📝 Codzienne użycie Git

### Zapisywanie zmian:

```bash
# Sprawdź co się zmieniło
git status

# Dodaj zmienione pliki
git add .

# Zapisz commit z opisem
git commit -m "Dodałem nową funkcję XYZ"

# Wypchnij do GitHub
git push
```

### Cofanie zmian:

```bash
# Zobacz historię commitów
git log --oneline

# Cofnij do poprzedniego commita
git reset --soft HEAD~1

# Cofnij plik do ostatniego commita
git checkout -- nazwa-pliku.ts
```

### Pobieranie zmian (jeśli pracujesz z kilku urządzeń):

```bash
git pull
```

---

## 🔒 Co NIE WRZUCAĆ na GitHub (.gitignore)

Plik `.gitignore` już jest skonfigurowany! Ignoruje:

❌ `node_modules/` - zależności (za duże)
❌ `dist/` - zbudowana aplikacja
❌ `.env` - zmienne środowiskowe (BEZPIECZEŃSTWO!)
❌ Firebase debug logi
❌ Pliki systemowe (.DS_Store)

**WAŻNE:** ✅ `.gitignore` już zawiera wszystko co trzeba!

---

## ⚠️ BEZPIECZEŃSTWO

### ❌ NIGDY nie wrzucaj na GitHub:

1. **Firebase config z prawdziwymi kluczami**
   - `app/src/firebase.ts` MA być w .gitignore jeśli ma prawdziwe klucze
   - Alternatywnie: użyj zmiennych środowiskowych

2. **SendGrid API keys**
   - Trzymaj w Firebase Functions config (bezpieczne)

3. **Hasła, tokeny, prywatne klucze**

### ✅ Bezpieczna praktyka:

**Opcja 1: Firebase config jako zmienne środowiskowe (zalecane)**

Stwórz plik `.env` (w .gitignore):
```
VITE_FIREBASE_API_KEY=AIzaSyXXX...
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
```

Użyj w `firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
}
```

**Opcja 2: Wrzuć firebase.ts z placeholder'ami**

Obecny stan (z "YOUR_API_KEY") jest OK do wrzucenia na GitHub.
Prawdziwe klucze trzymaj lokalnie (nie commituj).

---

## 🔄 CI/CD - Automatyczny deployment

### Połącz GitHub z Firebase Hosting:

1. **W projekcie lokalnym:**
   ```bash
   firebase init hosting:github
   ```

2. **Zaloguj się do GitHub** (prompt otworzy przeglądarkę)

3. **Wybierz repozytorium**

4. Firebase stworzy pliki:
   - `.github/workflows/firebase-hosting-merge.yml` (deploy na produkcję)
   - `.github/workflows/firebase-hosting-pull-request.yml` (preview)

5. **Od teraz:**
   - Każdy `git push` → automatyczny deploy! 🚀
   - Pull request → preview URL

---

## 📊 Struktura commitów (best practices)

### Dobre commity:

```bash
git commit -m "feat: Dodano wyszukiwanie muzyków po instrumencie"
git commit -m "fix: Naprawiono błąd w formularzu wypożyczeń"
git commit -m "docs: Zaktualizowano README"
git commit -m "style: Poprawiono wygląd przycisków"
```

### Prefixes:

- `feat:` - nowa funkcja
- `fix:` - naprawa błędu
- `docs:` - dokumentacja
- `style:` - style/wygląd
- `refactor:` - refaktoryzacja kodu
- `test:` - testy
- `chore:` - czynności porządkowe

---

## 🌿 Branches (dla zaawansowanych)

```bash
# Stwórz nowy branch dla nowej funkcji
git checkout -b feature/email-reminders

# Pracuj, commituj
git add .
git commit -m "feat: Dodano przypomnienia email"

# Wróć do main
git checkout main

# Merge brancha
git merge feature/email-reminders

# Wypchnij
git push
```

---

## 🔍 GitHub jako backup

### Klonowanie projektu na innym komputerze:

```bash
git clone https://github.com/TWOJA-NAZWA/bibliotekarz-opery.git
cd bibliotekarz-opery

# Zainstaluj zależności
cd app && npm install
cd ../functions && npm install

# Skonfiguruj Firebase (firebase.ts)
# Gotowe!
```

---

## 📦 README.md dla GitHub

Stwórz ładny README dla GitHub (opcjonalnie):

```markdown
# 🎵 Bibliotekarz Opery

Aplikacja PWA do zarządzania wypożyczeniami nut w operze.

![Screenshot](screenshot.png)

## 🚀 Features

- Zarządzanie muzykami
- Zarządzanie nutami
- System wypożyczeń
- Automatyczne emaile
- PWA (działa na iOS/Android)

## 🛠️ Tech Stack

- React + TypeScript
- Firebase
- Tailwind CSS
- Vite

## 📱 Demo

[Live Demo](https://your-project.web.app)

## 🔧 Setup

Zobacz [SETUP-GUIDE.md](SETUP-GUIDE.md)
```

---

## ✅ Checklist - GitHub Setup

- [ ] Konto GitHub założone
- [ ] Git zainstalowany lokalnie
- [ ] Git skonfigurowany (name, email)
- [ ] Repozytorium stworzone na GitHub
- [ ] Lokalny projekt podłączony (`git remote add origin`)
- [ ] Pierwszy commit i push wykonany
- [ ] `.gitignore` sprawdzony (nie wrzucać kluczy!)
- [ ] (Opcjonalnie) CI/CD skonfigurowane

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"
→ Skonfiguruj SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TWOJA-NAZWA/bibliotekarz-opery.git
```

### "Your branch is ahead of origin/main"
```bash
git push
```

### Przypadkowo wrzuciłem tajne klucze!
1. Zmień klucze NATYCHMIAST (Firebase, SendGrid)
2. Usuń z historii: `git filter-branch` (zaawansowane)
3. Force push: `git push --force`
4. Lepiej: stwórz nowe repo, zmieniając klucze

---

## 📚 Więcej informacji

- GitHub Docs: https://docs.github.com
- Git Tutorial: https://git-scm.com/book/pl/v2
- Firebase GitHub Actions: https://firebase.google.com/docs/hosting/github-integration

---

**Powodzenia z GitHub! 🐙**

Twój kod jest teraz bezpieczny i zawsze dostępny!

