# Prompty — Higgsfield (assety) + projektowanie strony

Dwa rodzaje promptów: (A) do generowania/ulepszania grafik w Higgsfield,
(B) do zlecania Claude'owi projektu strony. Kopiuj, podmieniaj `[…]`, używaj.

---

## A. HIGGSFIELD — assety wizualne

### Jak to działa w tym systemie (workflow assetu)
1. **Masz swój materiał?** (logo, zdjęcie produktu, mockup) — podnieś jego jakość:
   - lokalny plik → `media_upload_widget` (wybierasz plik w widgecie), albo
   - plik z dysku po stronie agenta → `media_upload`, albo
   - URL → `media_import_url`. Dostajesz `media_id`.
   - Ulepszanie: `upscale_image` (do 2K/4K), `remove_background` (wycinka),
     `outpaint_image` (poszerzenie kadru pod hero 21:9), `reframe` (wideo).
2. **Potrzebujesz nowego assetu?** → `generate_image` (obraz) / `generate_video` (wideo).
   Nie wiesz, który model? → `models_explore(action:'recommend')` z opisem celu.
3. **Wpleć w stronę:** zapisz wynik do `assets/` i podlinkuj w HTML (`<img>` / `background`).
   Do hero najlepiej duży kadr (21:9 lub 16:9), potem `.media-frame` w CSS.

> Model. do zdjęć/portretów/UGC: `soul_2`. Do 4K/tekstu na grafice/diagramów:
> `nano_banana_pro`. Do reklam/produktu: `marketing_studio_image`. Zawsze możesz
> dać `get_cost:true`, by najpierw sprawdzić koszt w kredytach.

### Recepta na prompt do grafiki (struktura, która daje „designerski" efekt)
`[podmiot] + [kompozycja/kadr] + [światło] + [materiał/tekstura] + [paleta] + [nastrój] + [jakość]`

### Gotowe prompty (EN — modele lepiej rozumieją angielski)

**Hero — abstrakcyjne tło (bezpieczne, uniwersalne):**
```
Abstract premium background, soft volumetric gradient mesh, deep near-black base
with a single electric [lime/cyan/violet] light source, fine film grain, subtle
depth of field, elegant negative space on the [left/right] for text, cinematic,
ultra high detail, 21:9, no text, no logo
```

**Hero — realistyczny produkt/scena (pod e-commerce/SaaS):**
```
[opis produktu] on a minimalist studio set, dramatic rim light, matte surfaces,
shallow depth of field, muted [kolor] palette with one accent, editorial product
photography, hyper-detailed, 16:9, clean composition with room for a headline
```

**Tekstura / materiał (do tła sekcji, subtelne):**
```
Seamless subtle texture, [brushed metal / soft matte paper / dark frosted glass],
extremely fine grain, low contrast, muted, tileable, no text — used as a faint
section background
```

**Ikonografia / spot illustration (zamiast emoji):**
```
Minimal 3D iso icon of [pojęcie], single accent color [kolor] on transparent-like
dark background, soft studio light, clean, consistent set style, no text
```

**Ulepszenie WŁASNEGO materiału (po uploadzie → masz media_id):**
- Wytnij tło: `remove_background(image_id: <media_id>)`
- Podnieś do 4K: `upscale_image(image_id: <media_id>, width, height, resolution:'4k')`
- Poszerz pod hero 21:9: `outpaint_image(image_id: <media_id>, aspect_ratio:'21:9')`
- Wariant „na motyw marki” (i2i z Twoim zdjęciem jako referencją):
```
generate_image z medias:[{value:<media_id>, role:'reference'}], model:'soul_2',
prompt: "keep the product exactly, restyle scene to [nastrój marki], [światło],
[paleta], premium editorial, 16:9"
```

### Higienizacja assetów
- Hero/tła eksportuj szeroko (21:9/16:9), sekcje 4:3/1:1, portrety 4:5.
- Zapisuj do `assets/` z czytelną nazwą: `omiko-hero-21x9.webp`.
- Konwertuj do `.webp`/`.avif` dla wagi; trzymaj `alt` opisowy.
- Do tekstu na grafice używaj `nano_banana_pro` (inne modele psują litery).

---

## B. PROJEKTOWANIE — prompt do Claude (start nowej strony)

Wklej i uzupełnij, gdy zaczynasz nową stronę w tym systemie:

```
Zbuduj stronę-demo w naszym systemie (design-system/ + Playwright).
- Marka / temat: [nazwa, branża]
- Cel strony: [np. landing sprzedażowy / prezentacja produktu / portfolio]
- Grupa docelowa: [kto]
- Nastrój wizualny: [np. „precyzyjny fintech", „ciepłe rzemiosło", „brutalist tech"]
- Paleta akcentu: [domyślna limonka / ember / violet / cyan / gold / rose / własna]
- Kluczowe treści (użyj DOKŁADNIE tych faktów, bez zmyślania): [wklej copy, liczby,
  usługi, dane kontaktowe]
- Sekcje: [nav, hero, …, footer]
- Assety: [mam własne: … / wygeneruj przez Higgsfield: …]

Wymagania: trzymaj się PRINCIPLES.md (zero „AI slop"), jedno mocne hero,
oryginalny layout (łam siatkę), klikalne elementy reagują. Po zbudowaniu odpal
scripts/shoot.mjs, obejrzyj zrzuty na 3 szerokościach i iteruj aż będzie perfekcyjnie.
```

### Prompt do iteracji (po obejrzeniu zrzutów)
```
Na podstawie zrzutów [nazwa]: popraw [np. „hero za słabe — powiększ nagłówek do
--step-6, dodaj mesh; karty za ciasne — zwiększ padding; mobile: nav nachodzi na
CTA"]. Zachowaj resztę. Odpal shoot ponownie i pokaż różnicę.
```

### Zasada nadrzędna dla treści
**Nigdy nie zmyślaj faktów o prawdziwej firmie** (ceny, statystyki, referencje).
Jeśli danych brak — użyj wyraźnie oznaczonych placeholderów i dopytaj użytkownika.
