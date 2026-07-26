/* =============================================================================
   bundle.mjs — Eksport strony do JEDNEGO samodzielnego pliku HTML.
   -----------------------------------------------------------------------------
   Wkleja wszystkie lokalne <link rel=stylesheet> i <script src> do środka pliku,
   a lokalne obrazy (opcjonalnie) zamienia na data: URI. Efekt: jeden .html,
   który otworzysz/wyślesz gdziekolwiek — bez folderów, bez internetu.

   Użycie:
     node scripts/bundle.mjs <ścieżka-do.html> [--out plik.html] [--assets]

     --out <plik>   Nazwa pliku wynikowego (domyślnie: <nazwa>.standalone.html)
     --assets       Osadź także lokalne obrazy (<img src>, url() w CSS) jako base64

   Przykład:
     node scripts/bundle.mjs sites/omiko/index.html --assets
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
if (!argv[0] || argv[0].startsWith("--")) {
  console.error("✗ Podaj ścieżkę do pliku HTML.\n  np. node scripts/bundle.mjs sites/omiko/index.html");
  process.exit(1);
}
const src = path.resolve(argv[0]);
if (!fs.existsSync(src)) { console.error("✗ Nie znaleziono pliku:", src); process.exit(1); }
const dir = path.dirname(src);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i > -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const embedAssets = argv.includes("--assets");
const outPath = path.resolve(opt("out", path.join(dir, path.basename(src).replace(/\.html?$/i, "") + ".standalone.html")));

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff" };
const dataURI = (file) => {
  const ext = path.extname(file).toLowerCase();
  const b64 = fs.readFileSync(file).toString("base64");
  return `data:${MIME[ext] || "application/octet-stream"};base64,${b64}`;
};
const isLocal = (u) => u && !/^(https?:)?\/\//i.test(u) && !u.startsWith("data:") && !u.startsWith("#");

let html = fs.readFileSync(src, "utf8");
let css = 0, js = 0, img = 0;

/* --- Osadź arkusze stylów --- */
html = html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (tag) => {
  const m = tag.match(/href=["']([^"']+)["']/i);
  if (!m || !isLocal(m[1])) return tag;
  const file = path.resolve(dir, m[1]);
  if (!fs.existsSync(file)) return tag;
  let content = fs.readFileSync(file, "utf8");
  if (embedAssets) content = inlineCssUrls(content, path.dirname(file));
  css++;
  return `<style data-from="${m[1]}">\n${content}\n</style>`;
});

/* --- Osadź skrypty --- */
html = html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi, (tag, href) => {
  if (!isLocal(href)) return tag;
  const file = path.resolve(dir, href);
  if (!fs.existsSync(file)) return tag;
  js++;
  return `<script data-from="${href}">\n${fs.readFileSync(file, "utf8")}\n</script>`;
});

/* --- Osadź obrazy w <img src> (opcjonalnie) --- */
if (embedAssets) {
  html = html.replace(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, (tag, href) => {
    if (!isLocal(href)) return tag;
    const file = path.resolve(dir, href);
    if (!fs.existsSync(file)) return tag;
    img++;
    return tag.replace(href, dataURI(file));
  });
}

function inlineCssUrls(cssText, cssDir) {
  return cssText.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/gi, (whole, u) => {
    if (!isLocal(u)) return whole;
    const file = path.resolve(cssDir, u);
    if (!fs.existsSync(file)) return whole;
    img++;
    return `url("${dataURI(file)}")`;
  });
}

fs.writeFileSync(outPath, html);
const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`\n✓ Samodzielny plik: ${path.relative(process.cwd(), outPath)} (${kb} kB)`);
console.log(`  wklejono: ${css} CSS, ${js} JS${embedAssets ? `, ${img} zasobów` : ""}`);
console.log(`  → Otwórz go w przeglądarce lub wyślij — działa bez żadnych innych plików.\n`);
