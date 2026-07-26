# Zasady projektowe — jak robić strony, które wyglądają jak od najlepszego designera

To jest „biblia" tego systemu. Zanim napiszesz choć jedną sekcję, przeczytaj
sekcje 1–3. Reszta to referencja przy pracy.

Cel: **oryginalne, wciągające strony, które NIE wyglądają jak wygenerowane przez AI.**

---

## 1. Czego unikać — „AI slop" (natychmiastowe czerwone flagi)

Te rzeczy krzyczą „zrobił to bot z szablonu". Świadomie ich unikaj:

- ❌ Fioletowo-niebieski gradient na wszystkim + font Inter + zaokrąglone karty z cieniem `0 4px 6px`.
- ❌ Trzy identyczne karty z ikonką w kółku, nagłówkiem i akapitem lorem ipsum.
- ❌ Hero: wyśrodkowany nagłówek + podtytuł + dwa przyciski + „obrazek produktu" po prawej. Zawsze to samo.
- ❌ Emoji jako ikony funkcji. 🚀✨💡 = amatorka.
- ❌ Sekcje o równej wysokości, ten sam rytm, zero hierarchii, zero napięcia.
- ❌ Ogólnikowy copy: „Rozwiązania nowej generacji", „Wznieś swój biznes na wyżyny".
- ❌ Domyślne cienie i zaokrąglenia bez intencji. Wszystko `border-radius: 8px`.
- ❌ Idealna symetria wszędzie. Prawdziwy design ma **celowe** złamania.

## 2. Co robią najlepsi — 10 dźwigni „premium"

1. **Kontrast typograficzny.** Wielki, ciasny (`letter-spacing` ujemny) nagłówek display
   kontra mała, spokojna treść. Mono-eyebrow nad nagłówkiem (nasza sygnatura: `.eyebrow`).
2. **Skala jest odważna.** Hero ma `--step-5`/`--step-6`. Nie bój się liter na pół ekranu.
3. **Przestrzeń robi luksus.** Dużo powietrza (`--section-y`, `--space-16+`). Ciasnota = tanio.
4. **Ograniczona paleta.** 1 kolor akcentu + neutralne. Kolor = rzadki, więc znaczący.
5. **Głębia przez warstwy, nie przez jeden cień.** Używaj `--shadow-lg` (wielowarstwowy),
   ziarna (`.grain`) i subtelnego światła (`.mesh`, `.aurora`), nie płaskich boxów.
6. **Ruch z intencją.** Reveal-on-scroll z kaskadą (`data-stagger`), mikro-interakcje na hover.
   Szybko (0.15–0.55s) i miękko (`--ease-out`). Nigdy „bujających się" wszystkich elementów.
7. **Nietypowy layout.** Łam siatkę: asymetria, treść na krawędzi (`.full-bleed`),
   nakładające się warstwy, duże liczby jako element graficzny, tekst pod kątem.
8. **Detal 1px.** Cienkie linie (`--surface-line`), obwódki gradientowe (`.ring-grad`),
   wewnętrzny highlight (`inset` w cieniach). To widać podświadomie.
9. **Prawdziwy, konkretny copy.** Liczby, nazwy, fakty. „14 dni" > „szybko".
10. **Spójność = system.** Wszystko z `tokens.css`. Jedna decyzja, powtórzona = profesjonalizm.

## 3. Anatomia hero, które wciąga (nie „tuzinkowe")

Hero decyduje w 3 sekundy. Wybierz JEDEN mocny pomysł, nie wszystkie naraz:

- **Typograficzne hero** — gigantyczny nagłówek jako główny wizual (`.display`, `--step-6`),
  tło mesh/aurora, minimum reszty. Działa zawsze, wygląda drogo.
- **Split z napięciem** — asymetryczny podział (np. 60/40), po jednej stronie tekst,
  po drugiej mocny obraz z Higgsfield w `.media-frame`, lekko wychodzący poza siatkę.
- **Hero z „dowodem"** — nagłówek + żywy mockup produktu/UI z realnymi danymi (nie lorem).
- **Immersyjne** — pełnoekranowy obraz/wideo tła z gradientową maską i tekstem na wierzchu.

Zasady niezależne od wariantu:
- Eyebrow (kategoria) → nagłówek (obietnica) → jedno zdanie (dla kogo/po co) → 1 główne CTA.
- Jedno **główne** CTA. Drugie jako ghost. Nie trzy równorzędne.
- Nad „foldem" musi być widać wartość — testuj zrzutem `--fold` z Playwright.

## 4. Kolor — jak dobrać, by nie było generycznie

- Zacznij od **nastroju**, nie od koloru: „precyzyjny fintech", „ciepłe rzemiosło",
  „brutalist tech", „redakcyjny luksus". Nastrój dyktuje paletę.
- Domyślny motyw jest ciemny i chłodny z **limonkowym** akcentem (celowo nie-fioletowym).
  Gotowe alternatywy w `tokens.css`: `.accent-ember/violet/cyan/gold/rose` (klasa na `<body>`).
- Neutralne mają **podton** (u nas chłodny 265°). Czysta szarość `#888` wygląda martwo.
- Kontrast tekstu: dąż do WCAG AA (≥4.5:1 dla treści). `--ink` na `--bg` to spełnia.
- Akcent to ~5–10% powierzchni. Jeśli akcentu jest dużo — to już nie akcent.

## 5. Typografia

- Domyślnie stack systemowy (offline, zero zależności). Dla maks. oryginalności **osadź
  własny font** (patrz sekcja 9).
- Skala z `tokens.css` (`--step--1`…`--step-6`). **Nie** wpisuj px w komponentach.
- `text-wrap: balance` na nagłówkach, `pretty` na akapitach (już w `base.css`).
- Długość wiersza treści ≤ `--measure` (68ch). Dłuższe = męczy.
- Mono (`--font-mono`) do etykiet, liczb, „technicznych" detali — buduje charakter.

## 6. Ruch i mikro-interakcje

- Reveal: dodaj `data-reveal` (lub `="left"/"right"/"scale"`) + `data-stagger="80"` na rodzicu.
- Hover kart: `.card-hover`. Przyciski mają sprężynę wbudowaną.
- `.spotlight`, `.tilt`, liczniki `data-count` — używaj **punktowo**, na akcentach.
- Zawsze respektuj `prefers-reduced-motion` (system to robi automatycznie).
- Do zrzutów Playwright zamraża animacje → oceniaj kompozycję, nie klatkę animacji.

## 7. Responsywność (mobile ma wyglądać równie drogo)

- Testuj każdą stronę na 3 szerokościach: 1440 / 834 / 390 (robi to `shoot.mjs`).
- Siatki `.cols-*` spadają do 1 kolumny < 900px (chyba że `.keep-2`).
- Hero na mobile: zmniejsz `--step` (clamp już to robi), skróć CTA, ukryj ozdobniki.
- Sprawdź, czy nic nie wyjeżdża w poziomie (`overflow-x` na body jest ucięty, ale i tak patrz).

## 8. Dostępność = jakość (nie opcja)

- Semantyka: `header/nav/main/section/footer`, jeden `<h1>`, logiczna hierarchia nagłówków.
- Każdy obraz: sensowny `alt` (lub `alt=""` gdy czysto dekoracyjny).
- Focus widoczny (`:focus-visible` w base). Klikalne = `<a>`/`<button>`, nie `<div onclick>`.
- Kontrast (sekcja 4). Ruch ograniczalny (sekcja 6).

## 9. Osadzanie własnego fontu (maks. oryginalność, wciąż offline)

Stack systemowy jest bezpieczny, ale własny font to największy skok „charakteru".
Aby demo działało z pliku bez internetu, osadź font **lokalnie** (nie z CDN):

```css
@font-face{
  font-family:"Twoj Display"; font-weight:400 800; font-display:swap;
  src:url("../assets/fonts/twoj-display.woff2") format("woff2");
}
:root{ --font-display:"Twoj Display", ui-sans-serif, system-ui, sans-serif; }
```

Wrzuć plik `.woff2` do `assets/fonts/`. Dobre, darmowe pod komercję rodziny display
o wyraźnym charakterze: Space Grotesk, Clash Display, Cabinet Grotesk, Fraunces (serif
redakcyjny), Instrument Serif, Bricolage Grotesque. (Pobierasz je sam — patrz README.)

## 10. Szybka checklista przed „gotowe"

- [ ] Hero komunikuje wartość nad foldem (zrzut `--fold` na 3 szerokościach)?
- [ ] Jest JEDEN dominujący pomysł wizualny, nie pięć?
- [ ] Copy jest konkretny (liczby, fakty), nie ogólnikowy?
- [ ] Paleta ograniczona, akcent rzadki?
- [ ] Rytm pionowy spójny (odstępy z tokenów)?
- [ ] Mobile wygląda równie dobrze jak desktop?
- [ ] Zero „AI-slop" z sekcji 1?
- [ ] Kontrast AA, focus widoczny, alt-y na miejscu?
- [ ] Klikalne elementy naprawdę reagują (hover, aktywne stany)?
