# 🎨 Ikony PWA - Instrukcja

Aplikacja PWA wymaga ikon w różnych rozmiarach. Musisz je wygenerować i umieścić w folderze `app/public/`.

## 📋 Wymagane pliki

W folderze `app/public/` potrzebujesz:

- `pwa-192x192.png` - ikona 192x192 px
- `pwa-512x512.png` - ikona 512x512 px
- `apple-touch-icon.png` - ikona 180x180 px (dla iOS)
- `favicon.ico` - favicon 32x32 px

## 🎨 Jak stworzyć ikony?

### Opcja 1: Online generator (najłatwiejsze)

1. Stwórz prostą ikonę lub logo (kwadrat, min. 512x512 px)
2. Wejdź na: https://www.pwabuilder.com/imageGenerator
3. Upload swojego obrazu
4. Pobierz wygenerowane ikony
5. Skopiuj do `app/public/`

### Opcja 2: Canva (darmowe)

1. Wejdź na: https://www.canva.com
2. Stwórz nowy projekt: **Logo** (500 x 500 px)
3. Zaprojektuj ikonę (np. symbol nuty 🎵 z tekstem "BO")
4. Download jako PNG
5. Użyj narzędzia online do resize'u na różne rozmiary:
   - https://www.iloveimg.com/resize-image

### Opcja 3: Figma (dla designerów)

1. Stwórz artboard 512x512 px
2. Zaprojektuj ikonę
3. Export jako PNG w różnych rozmiarach

### Opcja 4: Szybki placeholder (do testów)

Użyj emoji jako tymczasowej ikony:

1. Wejdź na: https://favicon.io/emoji-favicons/
2. Wybierz emoji 🎵 (musical note)
3. Download
4. Rename pliki zgodnie z wymaganiami

## 🖼️ Przykładowy design ikony

```
┌─────────────┐
│             │
│   🎵        │  Logo/symbol w środku
│             │  Tło: ciemny szary (#1f2937)
│   BO        │  Tekst: biały
│             │
└─────────────┘
```

Gdzie:
- **🎵** - symbol nuty
- **BO** - skrót od "Bibliotekarz Opery"
- **Tło** - ciemny szary (pasuje do theme_color w manifest.json)

## 🔧 Po wygenerowaniu

1. Umieść pliki w `app/public/`:
   ```
   app/public/
   ├── pwa-192x192.png
   ├── pwa-512x512.png
   ├── apple-touch-icon.png
   └── favicon.ico
   ```

2. Rebuild aplikacji:
   ```bash
   cd app
   npm run build
   ```

3. Deploy ponownie:
   ```bash
   cd ..
   firebase deploy --only hosting
   ```

## ⚠️ Tymczasowe rozwiązanie

Na razie możesz użyć placeholder'ów - aplikacja będzie działać, ale ikona będzie domyślna.

Kiedy będziesz gotowy z właściwą ikoną, po prostu zastąp pliki i deploy ponownie.

## 📐 Wymiary szczegółowe

| Plik | Rozmiar | Cel |
|------|---------|-----|
| `pwa-192x192.png` | 192x192 px | Android home screen |
| `pwa-512x512.png` | 512x512 px | Android splash screen |
| `apple-touch-icon.png` | 180x180 px | iOS home screen |
| `favicon.ico` | 32x32 px | Browser tab |

Wszystkie powinny być w formacie PNG (oprócz favicon - ICO).

## 🎨 Kolory z aplikacji (dla spójności)

- **Primary dark:** `#1f2937` (gray-800)
- **Primary light:** `#f9fafb` (gray-50)
- **Accent:** `#374151` (gray-700)
- **Text:** `#111827` (gray-900)

---

**Tip:** Możesz też zatrudnić designera na Fiverr za ~50-100 zł do stworzenia profesjonalnej ikony.

