/* =============================================================================
   motion.js — Interakcje bez zależności. Działa z file:// (offline).
   Dołącz w HTML na końcu body:
     script src="../../design-system/motion.js" defer  (w znacznikach <>)
   Wszystko jest progresywne: bez JS strona nadal działa i jest widoczna.
   ========================================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.remove("no-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("reduce-motion");
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* --- 1. Split text (data-split) — litery w .char, kaskada przez .is-in ---
     Dostępność: oryginalny tekst trafia do aria-label, litery są aria-hidden.
     Dzielimy tylko gdy !reduce — inaczej zostaje zwykły, czytelny tekst. */
  const splits = $$("[data-split]");
  if (!reduce) splits.forEach((el) => {
    if (el.dataset.splitReady) return;
    const text = el.textContent;
    el.setAttribute("aria-label", el.getAttribute("aria-label") || text.trim());
    el.textContent = "";
    let i = 0;
    // Grupujemy litery w SŁOWA (nie łamią się w środku); spacje = punkty łamania linii.
    for (const part of text.split(/(\s+)/)) {
      if (part === "") continue;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); continue; }
      const word = document.createElement("span");
      word.className = "word";
      word.setAttribute("aria-hidden", "true");
      for (const ch of part) {
        const s = document.createElement("span");
        s.className = "char";
        s.style.setProperty("--i", i++);
        s.textContent = ch;
        word.appendChild(s);
      }
      el.appendChild(word);
    }
    el.dataset.splitReady = "1";
  });

  /* --- 2. Reveal on scroll (+ stagger) — TEN SAM IO obsługuje data-split --- */
  const revealTargets = $$("[data-reveal]").concat(splits);
  if (revealTargets.length && "IntersectionObserver" in window && !reduce) {
    // opóźnienia kaskadowe dla dzieci w [data-stagger]
    $$("[data-stagger]").forEach((group) => {
      const step = parseFloat(group.dataset.stagger) || 80;
      $$("[data-reveal]", group).forEach((el, i) => {
        el.style.transitionDelay = `${i * step}ms`;
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  /* --- 2. Spotlight podążający za kursorem --------------------------------- */
  $$(".spotlight").forEach((el) => {
    el.addEventListener("pointermove", (ev) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${ev.clientX - r.left}px`);
      el.style.setProperty("--my", `${ev.clientY - r.top}px`);
    });
  });

  /* --- 3. Tilt 3D --------------------------------------------------------- */
  if (!reduce) $$(".tilt").forEach((el) => {
    const max = parseFloat(el.dataset.tilt) || 6;
    el.addEventListener("pointermove", (ev) => {
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - .5;
      const py = (ev.clientY - r.top) / r.height - .5;
      el.style.setProperty("--ry", `${px * max}deg`);
      el.style.setProperty("--rx", `${-py * max}deg`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
    });
  });

  /* --- 4. Liczniki (count-up) — <span data-count="1200" data-suffix="+"> --- */
  const counters = $$("[data-count]");
  const fmt = new Intl.NumberFormat("pl-PL");
  const runCounter = (el) => {
    if (el._counted) return; el._counted = true;   // idempotentne (IO + failsafe)
    const to = parseFloat(el.dataset.count);
    const suf = el.dataset.suffix || "";
    const pre = el.dataset.prefix || "";
    const dur = reduce ? 0 : (parseInt(el.dataset.dur) || 1400);
    const start = performance.now();
    const tick = (now) => {
      const t = dur ? Math.min((now - start) / dur, 1) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      const val = to % 1 ? (to * eased).toFixed(1) : Math.round(to * eased);
      el.textContent = pre + fmt.format(val) + suf;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const run = runCounter;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* --- 5. Nav: zmiana tła po scrollu + menu mobilne ----------------------- */
  const nav = document.querySelector("[data-nav]");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    const toggle = nav.querySelector("[data-nav-toggle]");
    if (toggle) toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open"); document.body.style.overflow = "";
    }));
  }

  /* --- 6. Przełącznik motywu (opcjonalny) --------------------------------- */
  $$("[data-theme-toggle]").forEach((btn) => btn.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    root.setAttribute("data-theme", cur === "light" ? "dark" : "light");
  }));

  /* --- 7. Smooth-scroll dla kotwic # (z offsetem nav) --------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  /* --- 8. Prosty akordeon (FAQ) — <details> działa natywnie, tu tylko ARIA - */
  $$("[data-tabs]").forEach((wrap) => {
    const tabs = $$("[role=tab]", wrap);
    const panels = $$("[role=tabpanel]", wrap);
    tabs.forEach((tab, i) => tab.addEventListener("click", () => {
      tabs.forEach((t) => { t.setAttribute("aria-selected", "false"); });
      panels.forEach((p) => p.hidden = true);
      tab.setAttribute("aria-selected", "true");
      if (panels[i]) panels[i].hidden = false;
    }));
  });

  /* --- 9. Parallax warstwowy + sticky scene (jedna pętla rAF, scroll passive)
     Animujemy WYŁĄCZNIE transform (parallax) i zmienną --progress (sticky).
     will-change:transform tylko na elementach parallaxu. Wyłączone przy reduce. */
  const parallaxEls = $$("[data-parallax]");
  const scenes = $$("[data-sticky-scene]");
  if (!reduce && (parallaxEls.length || scenes.length)) {
    parallaxEls.forEach((el) => { el.style.willChange = "transform"; });
    const maxPx = parseFloat(getComputedStyle(root).getPropertyValue("--parallax-max")) || 40;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      for (const el of parallaxEls) {
        const speed = parseFloat(el.dataset.parallax) || 0;
        const r = el.getBoundingClientRect();
        const fromCenter = (r.top + r.height / 2) - vh / 2;   // px od środka ekranu
        let y = -fromCenter * speed;
        if (y > maxPx) y = maxPx; else if (y < -maxPx) y = -maxPx;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      }
      for (const el of scenes) {
        const r = el.getBoundingClientRect();
        const span = el.offsetHeight - vh;
        const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
        el.style.setProperty("--progress", p.toFixed(4));
      }
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* --- 10. FAILSAFE dla środowisk BEZ przewijania -------------------------
     W podglądzie/iframe renderowanym na pełną wysokość treści nie ma
     wewnętrznego scrolla, więc IntersectionObserver nigdy nie odsłoni sekcji
     ani nie uruchomi liczników. Wtedy pokazujemy wszystko od razu.
     W normalnej przeglądarce (jest co przewijać) animacje wejścia działają jak zwykle. */
  const revealAll = () => {
    $$("[data-reveal]:not(.is-in), [data-split]:not(.is-in)").forEach((el) => { el.style.transitionDelay = "0ms"; el.classList.add("is-in"); });
    counters.forEach(runCounter);
  };
  const failsafe = () => {
    const el = document.scrollingElement || document.documentElement;
    if (el.scrollHeight <= window.innerHeight + 8) revealAll();   // nie da się przewinąć → pokaż
  };
  if (document.readyState === "complete") failsafe();
  else addEventListener("load", failsafe);
  addEventListener("resize", failsafe, { passive: true });
  setTimeout(failsafe, 500);
})();
