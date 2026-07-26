/* =============================================================================
   shoot.mjs — PĘTLA WIZUALNA (serce "Web Design Killer Setup").
   -----------------------------------------------------------------------------
   Renderuje lokalny plik HTML w prawdziwej przeglądarce (Chromium) i zapisuje
   zrzuty, które Claude następnie OGLĄDA i na ich podstawie poprawia design.

   Użycie:
     node scripts/shoot.mjs <ścieżka-do.html> [opcje]

   Opcje:
     --out <katalog>        Gdzie zapisać zrzuty (domyślnie: <folder-strony>/screenshots)
     --full                 Tylko pełne (full-page) zrzuty, bez "above the fold"
     --fold                 Tylko "above the fold" (pierwszy ekran), bez full-page
     --sections             Dodatkowo zrzut każdej sekcji [data-shot] osobno
     --widths 1440,834,390  Własna lista szerokości (px)
     --theme light|dark     Wymuś motyw (ustawia data-theme na <html>)
     --motion               NIE zamrażaj animacji (domyślnie zamrażamy dla stabilnych zrzutów)
     --wait <ms>            Dodatkowe oczekiwanie po załadowaniu (domyślnie 500)

   Przykłady:
     node scripts/shoot.mjs sites/omiko/index.html
     node scripts/shoot.mjs sites/omiko/index.html --sections --widths 1440,390
     npm run shot -- sites/omiko/index.html --theme light
   ========================================================================== */

import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

/* ---- Rozwiązanie ścieżki do Chromium -----------------------------------
   Preferuj preinstalowaną przeglądarkę (środowiska CI/chmura), z fallbackiem
   do tej pobranej przez Playwright. Ustaw PLAYWRIGHT_CHROMIUM aby wymusić. */
function resolveChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM && fs.existsSync(process.env.PLAYWRIGHT_CHROMIUM))
    return process.env.PLAYWRIGHT_CHROMIUM;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (base && fs.existsSync(base)) {
    const dir = fs.readdirSync(base).filter((d) => d.startsWith("chromium-")).sort().pop();
    if (dir) {
      const bin = path.join(base, dir, "chrome-linux", "chrome");
      if (fs.existsSync(bin)) return bin;
    }
  }
  return undefined; // pozwól Playwright użyć własnej przeglądarki
}
const executablePath = resolveChromium();

/* ---- Parsowanie argumentów ---------------------------------------------- */
const argv = process.argv.slice(2);
if (!argv[0] || argv[0].startsWith("--")) {
  console.error("✗ Podaj ścieżkę do pliku HTML.\n  np. node scripts/shoot.mjs sites/omiko/index.html");
  process.exit(1);
}
const target = path.resolve(argv[0]);
if (!fs.existsSync(target)) { console.error("✗ Nie znaleziono pliku:", target); process.exit(1); }

const flag = (name) => argv.includes(`--${name}`);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i > -1 && argv[i + 1] ? argv[i + 1] : def; };

const DEVICES = {
  desktop: { w: 1440, h: 900,  label: "desktop" },
  laptop:  { w: 1280, h: 800,  label: "laptop"  },
  tablet:  { w: 834,  h: 1112, label: "tablet"  },
  mobile:  { w: 390,  h: 844,  label: "mobile"  },
};
const widthsArg = opt("widths", null);
let devices;
if (widthsArg) {
  devices = widthsArg.split(",").map((w) => ({ w: parseInt(w.trim()), h: 900, label: `${w.trim()}w` }));
} else {
  devices = [DEVICES.desktop, DEVICES.tablet, DEVICES.mobile];
}

const doFull = !flag("fold");
const doFold = !flag("full");
const doSections = flag("sections");
const freezeMotion = !flag("motion");
const theme = opt("theme", null);
const extraWait = parseInt(opt("wait", "500"));

const stamp = path.basename(target).replace(/\.html?$/i, "");
const outDir = path.resolve(opt("out", path.join(path.dirname(target), "screenshots")));
fs.mkdirSync(outDir, { recursive: true });

/* ---- CSS zamrażający animacje (stabilne, powtarzalne zrzuty) ------------- */
const FREEZE_CSS = `*,*::before,*::after{animation-play-state:paused!important;
  animation-delay:-1ms!important;transition:none!important;
  scroll-behavior:auto!important;caret-color:transparent!important;}`;

const saved = [];

(async () => {
  console.log(`\n▶ Renderuję: ${path.relative(process.cwd(), target)}`);
  const browser = await chromium.launch(executablePath ? { executablePath } : {});

  for (const dev of devices) {
    const context = await browser.newContext({
      viewport: { width: dev.w, height: dev.h },
      deviceScaleFactor: 2,                       // ostre, "retina" zrzuty
      colorScheme: theme === "light" ? "light" : "dark",
      reducedMotion: freezeMotion ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

    await page.goto(pathToFileURL(target).href, { waitUntil: "networkidle" });
    if (theme) await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    if (freezeMotion) await page.addStyleTag({ content: FREEZE_CSS });

    // Poczekaj na fonty i "dojście" layoutu
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    await page.waitForTimeout(extraWait);

    // Uruchom reveal-y (przewiń, by IntersectionObserver odsłonił treść), potem wróć
    await page.evaluate(async () => {
      const H = document.body.scrollHeight, step = window.innerHeight * 0.8;
      for (let y = 0; y < H; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      // wymuś odsłonięcie wszystkiego, gdyby coś zostało poniżej progu
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    });
    await page.waitForTimeout(250);

    const base = `${stamp}--${dev.label}`;
    const SHOT = { animations: "disabled", caret: "hide", timeout: 60000 };

    if (doFold) {
      const p = path.join(outDir, `${base}--fold.png`);
      try { await page.screenshot({ ...SHOT, path: p }); saved.push(p); }
      catch (e) { console.log(`  ⚠ fold [${dev.label}] pominięto: ${e.message.split("\n")[0]}`); }
    }
    if (doFull) {
      const p = path.join(outDir, `${base}--full.png`);
      try { await page.screenshot({ ...SHOT, path: p, fullPage: true }); saved.push(p); }
      catch (e) { console.log(`  ⚠ full [${dev.label}] pominięto: ${e.message.split("\n")[0]}`); }
    }
    if (doSections) {
      const shots = await page.$$("[data-shot]");
      for (let i = 0; i < shots.length; i++) {
        const name = await shots[i].getAttribute("data-shot");
        const safe = (name || `sec${i + 1}`).replace(/[^a-z0-9-]+/gi, "-");
        const p = path.join(outDir, `${base}--${String(i + 1).padStart(2, "0")}-${safe}.png`);
        try { await shots[i].scrollIntoViewIfNeeded(); await shots[i].screenshot({ ...SHOT, path: p }); saved.push(p); }
        catch { /* sekcja poza flow — pomiń */ }
      }
    }

    if (errors.length) {
      console.log(`  ⚠ [${dev.label}] błędy w konsoli:`);
      [...new Set(errors)].slice(0, 6).forEach((e) => console.log(`      ${e}`));
    }
    console.log(`  ✓ ${dev.label} (${dev.w}px)`);
    await context.close();
  }

  await browser.close();
  console.log(`\n✓ Zapisano ${saved.length} zrzutów do: ${path.relative(process.cwd(), outDir)}/`);
  saved.forEach((p) => console.log("   • " + path.relative(process.cwd(), p)));
  console.log("\n→ Teraz OBEJRZYJ te pliki (narzędziem Read) i iteruj design.\n");
})().catch((e) => { console.error("✗ Błąd renderowania:", e); process.exit(1); });
