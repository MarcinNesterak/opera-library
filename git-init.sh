#!/bin/bash

# 🐙 Skrypt do inicjalizacji Git i push do GitHub
# Użycie: ./git-init.sh

echo "🎵 Bibliotekarz Opery - Git Setup"
echo "=================================="
echo ""

# Sprawdź czy Git jest zainstalowany
if ! command -v git &> /dev/null
then
    echo "❌ Git nie jest zainstalowany!"
    echo "Zainstaluj: xcode-select --install"
    exit 1
fi

echo "✅ Git zainstalowany"
echo ""

# Sprawdź czy już jest git repo
if [ -d ".git" ]; then
    echo "⚠️  Git repository już istnieje"
    echo ""
    read -p "Czy chcesz kontynuować? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        exit 1
    fi
else
    # Inicjalizuj Git
    echo "📦 Inicjalizacja Git repository..."
    git init
    echo "✅ Git zainicjalizowany"
    echo ""
fi

# Sprawdź czy user.name i user.email są ustawione
if [ -z "$(git config user.name)" ]; then
    echo "⚠️  Git user.name nie jest ustawiony"
    read -p "Podaj swoje imię i nazwisko: " git_name
    git config user.name "$git_name"
    echo "✅ Ustawiono user.name: $git_name"
fi

if [ -z "$(git config user.email)" ]; then
    echo "⚠️  Git user.email nie jest ustawiony"
    read -p "Podaj swój email: " git_email
    git config user.email "$git_email"
    echo "✅ Ustawiono user.email: $git_email"
fi

echo ""
echo "📋 Sprawdzam status plików..."
git status

echo ""
echo "📦 Dodaję pliki do stage..."
git add .

echo ""
echo "💾 Tworzę pierwszy commit..."
git commit -m "Initial commit - Bibliotekarz Opery v1.0.0"

echo ""
echo "✅ Commit utworzony!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🌐 NASTĘPNY KROK: Podłącz do GitHub"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Wejdź na: https://github.com/new"
echo "2. Nazwa: bibliotekarz-opery"
echo "3. Private/Public: wybierz"
echo "4. NIE zaznaczaj 'Initialize with README'"
echo "5. Create repository"
echo ""
echo "6. Skopiuj URL repozytorium (np. https://github.com/USERNAME/bibliotekarz-opery.git)"
echo ""
read -p "Podaj URL repozytorium: " repo_url

if [ -z "$repo_url" ]; then
    echo "⚠️  Nie podano URL. Przerwano."
    echo ""
    echo "Możesz podłączyć później używając:"
    echo "  git remote add origin <URL>"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    exit 0
fi

echo ""
echo "🔗 Dodaję remote origin..."
git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"

echo ""
echo "🌿 Zmieniam branch na 'main'..."
git branch -M main

echo ""
echo "🚀 Pushowanie do GitHub..."
git push -u origin main

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 SUKCES! Kod jest na GitHub!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Sprawdź: $repo_url"
echo ""
echo "Następne zmiany commituj używając:"
echo "  git add ."
echo "  git commit -m 'Opis zmian'"
echo "  git push"
echo ""

