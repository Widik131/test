/* =============================================================================
   serve.mjs — Mini serwer statyczny do PODGLĄDU lokalnego (NIE hosting).
   Działa tylko na Twoim komputerze (localhost). Przydatny, gdy chcesz kliknąć
   po demie w przeglądarce. Pliki HTML i tak otwierają się bez serwera (file://),
   ale serwer bywa wygodniejszy (poprawne ścieżki, brak ograniczeń file://).

   Użycie:  node scripts/serve.mjs [port]   (domyślnie 5173)
   Potem otwórz np. http://localhost:5173/sites/omiko/
   ========================================================================== */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = parseInt(process.argv[2] || "5173");

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm",
};

http.createServer((req, res) => {
  try {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    let fp = path.normalize(path.join(rootDir, rel));
    if (!fp.startsWith(rootDir)) { res.writeHead(403); return res.end("Forbidden"); }
    if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, "index.html");
    if (!fs.existsSync(fp)) { res.writeHead(404); return res.end("404: " + rel); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream" });
    fs.createReadStream(fp).pipe(res);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(port, () => {
  console.log(`\n▶ Podgląd lokalny: http://localhost:${port}/`);
  console.log(`  np. http://localhost:${port}/sites/omiko/\n  (Ctrl+C aby zatrzymać)\n`);
});
