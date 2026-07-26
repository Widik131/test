# Web Design Killer Setup — system do projektowania klikalnych stron-demo

System, w którym **od początku do końca sam zaprojektujesz oryginalnie wyglądające,
klikalne strony-demo w HTML** — bez hostowania, bez frameworków, bez zależności.
Otwierasz gotowy plik w przeglądarce i klikasz. Kropka.

Zbudowany wokół trzech filarów:
1. **Design-system w czystym CSS** — spójny fundament, który wygląda jak od najlepszego designera.
2. **Pętla wizualna Playwright** — Claude renderuje stronę, *ogląda* zrzuty i poprawia design, aż jest perfekcyjnie.
3. **Higgsfield (MCP)** — oryginalne grafiki hero/tła + ulepszanie Twoich własnych materiałów.

---

## Dlaczego to działa (idea „killer setup")

Zwykłe „wygeneruj stronę" daje kod na ślepo. Tutaj jest **sprzężenie zwrotne**:

```
   projekt (HTML/CSS)  ──►  scripts/shoot.mjs (Playwright robi zrzuty)
        ▲                              │
        │                              ▼
   poprawki  ◄──  Claude OGLĄDA zrzuty (desktop/tablet/mobile) i ocenia design
```

Claude nie „zgaduje" jak wygląda strona — naprawdę ją widzi i iteruje jak człowiek-designer.

---

## Struktura projektu

```
.
├── README.md                 ← jesteś tutaj (cały workflow)
├── package.json              ← skrypty npm + Playwright
├── design-system/
│   ├── tokens.css            ← kolory, typografia, przestrzeń, cienie, ruch (1 źródło prawdy)
│   ├── base.css              ← reset, układ, komponenty (przyciski, karty, formularze)
│   ├── effects.css           ← premium efekty (mesh, ziarno, glow, marquee, reveal)
│   ├── motion.js             ← interakcje bez zależności (reveal, tilt, liczniki, menu)
│   ├── PRINCIPLES.md         ← BIBLIA DESIGNU — przeczytaj przed projektowaniem
│   └── PROMPTS.md            ← prompty do Higgsfield i do zlecania projektu
├── scripts/
│   ├── shoot.mjs             ← pętla wizualna (zrzuty na 3 szerokościach)
│   └── serve.mjs             ← opcjonalny podgląd na localhost (nie hosting)
├── templates/
│   └── starter.html          ← pusty szkielet podpięty pod design-system
├── snippets/                 ← gotowe sekcje do kopiowania (nav, hero, features, cta…)
├── assets/                   ← grafiki (Twoje + z Higgsfield). Fonty w assets/fonts/
└── sites/
    └── omiko/                ← przykładowa strona-demo (dowód działania)
        ├── index.html
        └── screenshots/      ← generowane przez shoot.mjs
```

---

## Instalacja (raz)

```bash
npm install          # instaluje Playwright (przeglądarka Chromium jest już w środowisku)
```

> W tym środowisku Chromium jest preinstalowany (`PLAYWRIGHT_BROWSERS_PATH`), więc
> **nie** uruchamiaj `playwright install`. Na własnym komputerze zrób raz:
> `npx playwright install chromium`.

---

## Workflow — od zera do gotowego demo

### 1. Zbierz brief i treść
Uzupełnij prompt startowy z `design-system/PROMPTS.md` (sekcja B). **Kluczowe:**
podaj prawdziwą treść (fakty, liczby, usługi) — system nigdy nie zmyśla danych o firmie.

### 2. Załóż stronę
Skopiuj szkielet:
```bash
mkdir -p sites/moja-strona
cp templates/starter.html sites/moja-strona/index.html
```
Ustaw nastrój: motyw (`data-theme="dark|light"`) i akcent (klasa `accent-*` na `<body>`).

### 3. Zaprojektuj (trzymaj się PRINCIPLES.md)
Buduj sekcjami. Jedno mocne hero, oryginalny layout, klikalne elementy.
Nadawaj charakter w `<style>` strony — ale opieraj się na tokenach.

### 4. Assety (Higgsfield) — opcjonalnie, ale robi różnicę
Wg `PROMPTS.md` sekcja A:
- **Masz swój materiał** → upload (`media_upload_widget`) → ulepsz (`upscale_image`,
  `remove_background`, `outpaint_image`) → zapisz do `assets/`.
- **Potrzebujesz nowego** → `generate_image` (hero 21:9, tekstury, ikony).
Podlinkuj w HTML, oprawiaj w `.media-frame`.

### 5. PĘTLA WIZUALNA (najważniejsze)
```bash
node scripts/shoot.mjs sites/moja-strona/index.html
# warianty:
node scripts/shoot.mjs sites/moja-strona/index.html --sections      # + każda sekcja osobno
node scripts/shoot.mjs sites/moja-strona/index.html --widths 1440,390
node scripts/shoot.mjs sites/moja-strona/index.html --theme light
```
Zrzuty lądują w `sites/moja-strona/screenshots/` (desktop/tablet/mobile, fold + full).
**Obejrzyj je**, oceń wg checklisty z `PRINCIPLES.md` (sekcja 10) i popraw. Powtarzaj.

### 6. Podgląd na żywo (klikanie) — opcjonalnie
```bash
npm run serve        # http://localhost:5173/sites/moja-strona/
```
Albo po prostu otwórz plik `index.html` w przeglądarce (file://). Demo jest klikalne.

### 7. Zapisz / wyślij
To zwykłe pliki. Spakuj folder `sites/moja-strona/` (+ `design-system/` i `assets/`,
bo do nich prowadzą ścieżki `../../`) i wyślij — otworzy się u każdego, offline.
Chcesz w pełni samodzielny jeden plik? Patrz „Eksport pojedynczego pliku" niżej.

---

## Oznaczanie sekcji do zrzutów per-sekcja
Dodaj `data-shot="nazwa"` na `<section>`. Flaga `--sections` zrobi osobny zrzut każdej.

## Ruch / reveal w treści
- `data-reveal` (lub `="left"/"right"/"scale"`) na elemencie, `data-stagger="80"` na rodzicu.
- `.card-hover`, `.spotlight`, `.tilt`, liczniki `<span data-count="1200" data-suffix="+">`.
Szczegóły: `design-system/effects.css` i `motion.js`.

## Motywy i palety (szybka zmiana charakteru)
- Motyw: `data-theme="light"` na `<html>` lub przycisk `data-theme-toggle`.
- Akcent: klasa na `<body>` — `accent-ember`, `accent-violet`, `accent-cyan`, `accent-gold`, `accent-rose`.

## Własny font (największy skok oryginalności)
Wrzuć `.woff2` do `assets/fonts/`, dodaj `@font-face` i podmień `--font-display`
(instrukcja w `PRINCIPLES.md`, sekcja 9). Działa offline.

## Eksport pojedynczego, samodzielnego pliku HTML
Gdy chcesz JEDEN plik do wysłania: wklej zawartość `tokens.css`+`base.css`+`effects.css`
do `<style>`, `motion.js` do `<script>`, a obrazy osadź jako `data:` URI (base64).
Wtedy nie potrzeba żadnych ścieżek `../../` ani folderów.

---

## FAQ
- **Czy to jest hostowane?** Nie. To pliki lokalne. `serve.mjs` to tylko podgląd na Twoim localhoście.
- **Czy potrzebny internet?** Nie, jeśli assety i fonty są lokalne (zalecane). Sam design-system jest offline.
- **Po co Playwright, skoro widzę stronę w przeglądarce?** Bo dzięki zrzutom *Claude* też ją widzi i może iterować bez Ciebie.
- **Skąd biorę grafiki?** Higgsfield (MCP) — generowanie i ulepszanie Twoich materiałów. Patrz `PROMPTS.md`.
