/* ==========================================================
   SCRIPT.JS: typewriter on the Home hero
   It types "Hello, I'm", erases it, types your name, erases it, and repeats.
   The words come from data-words on the hero-hello line in index.html.
   Separate the words with a | sign, like data-words="Hello, I'm|Your Name".
   ========================================================== */

/* ---------- SETTINGS: change these numbers (1000 = 1 second) ---------- */
const TYPE_SPEED  = 90;    /* time per letter while writing */
const ERASE_SPEED = 45;    /* time per letter while erasing */
const HOLD_TIME   = 1800;  /* how long each finished word stays */
const PAUSE_TIME  = 500;   /* pause when the line is empty */

const title = document.querySelector(".hero-hello");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* does nothing on other pages, or for people who turned animations off
   (they just see the plain text that is already in the HTML) */
if (title && !reduceMotion) {

  const words = (title.dataset.words || title.textContent)
    .split("|").map((w) => w.trim()).filter(Boolean);

  /* ---------- the blinking line after the letters ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .hero-hello { min-height: 1.7em; }
    .tw-caret {
      display: inline-block;
      width: 0.08em;
      height: 1em;
      margin-left: 0.15em;
      vertical-align: -0.12em;
      background: var(--accent);
      animation: caret-blink 0.9s steps(1) infinite;
    }
    @keyframes caret-blink { 50% { opacity: 0; } }
  `;
  document.head.appendChild(style);

  /* screen readers read the full line, not the half-typed letters */
  title.setAttribute("aria-label", words.join(" "));

  const text = document.createElement("span");
  const caret = document.createElement("span");
  text.setAttribute("aria-hidden", "true");
  caret.className = "tw-caret";
  caret.setAttribute("aria-hidden", "true");
  title.textContent = "";
  title.append(text, caret);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function loop() {
    while (true) {
      for (let i = 0; i < words.length; i++) {
        title.classList.toggle("is-name", i > 0);        /* every word after the first is styled as your name */

        for (let n = 1; n <= words[i].length; n++) {     /* write */
          text.textContent = words[i].slice(0, n);
          await wait(TYPE_SPEED);
        }
        await wait(HOLD_TIME);

        for (let n = words[i].length - 1; n >= 0; n--) { /* erase */
          text.textContent = words[i].slice(0, n);
          await wait(ERASE_SPEED);
        }
        await wait(PAUSE_TIME);
      }
    }
  }

  loop();
}

/* ==========================================================
   LOGO: on hover the letters scramble into random characters,
   then settle back into the name, one by one from left to right.
   (No icon. Scrambling only.)
   ========================================================== */
(function () {
  /* ---------- SETTINGS ---------- */
  const SCRAMBLE_TIME = 600; /* how long all the letters scramble (1000 = 1 second) */
  const SETTLE_STEP   = 70;  /* time between each letter settling back into place */
  const RANDOM_LETTERS = "abcdefghijklmnopqrstuvwxyz0123456789#@$%&*?";

  const logo = document.querySelector(".logo");
  const logoText = logo ? logo.querySelector("span") : null;
  if (!logo || !logoText || reduceMotion) return;

  const original = logoText.textContent.trim();
  const randomChar = () => RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)];

  /* screen readers should read the real name, not the scrambled letters */
  logo.setAttribute("aria-label", original);
  logoText.setAttribute("aria-hidden", "true");

  let timer = null;

  /* mouse enters: scramble, then settle back into the name */
  function scramble() {
    clearInterval(timer);
    const start = Date.now();
    timer = setInterval(function () {
      const time = Date.now() - start;
      logoText.textContent = Array.from(original, (c, i) =>
        c === " " || time > SCRAMBLE_TIME + i * SETTLE_STEP ? c : randomChar()
      ).join("");
      if (time > SCRAMBLE_TIME + original.length * SETTLE_STEP) {
        clearInterval(timer);
        logoText.textContent = original;
      }
    }, 45);
  }

  logo.addEventListener("mouseenter", scramble);
})();

/* ==========================================================
   PAGE CHANGE: when you click a link to another page of this site,
   the header and the page fade out first, then the next page opens
   (and fades in by itself, see style.css section 15).
   Links that open in a new tab, go to other sites, or stay on the
   same page are left alone. Skipped if reduced motion is on.
   ========================================================== */
(function () {
  const LEAVE_TIME = 350;   /* must match the 0.35s in style.css section 15 (1000 = 1 second) */

  /* when you come back with the Back button, make sure the page is visible again */
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) document.body.classList.remove("page-leave");
  });

  if (reduceMotion) return;

  document.querySelectorAll("a[href]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;       /* new tab shortcuts */
      if (link.target && link.target !== "_self") return;                 /* opens in a new tab */
      if (link.hasAttribute("download")) return;
      if (link.protocol !== location.protocol || link.host !== location.host) return;   /* other sites, mailto */
      if (link.pathname === location.pathname) return;                    /* same page, # links */

      e.preventDefault();
      document.body.classList.add("page-leave");
      setTimeout(function () { window.location.href = link.href; }, LEAVE_TIME);
    });
  });
})();

/* ==========================================================
   SOCIAL RAIL: one icon fixed at the bottom right of every page.
   Hover it and your social icons fan out in a curved row.
   TO EDIT: replace the three href links below with your own.
   ========================================================== */
(function () {
  const links = [
    { name: "GitHub",   href: "https://github.com/yourname",
      icon: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>' },
    { name: "LinkedIn", href: "https://linkedin.com/in/yourname",
      icon: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>' },
    { name: "Email",    href: "mailto:you@email.com",
      icon: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>' }
  ];

  /* one share icon; hover it to open the curved row of socials */
  const SHARE_ICON = '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>';

  const rail = document.createElement("div");
  rail.className = "social-rail";
  rail.innerHTML =
    '<span class="social-trigger" tabindex="0" role="button" aria-label="Socials">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + SHARE_ICON + '</svg></span>' +
    '<div class="social-menu">' +
      links.map(function (l) {
        const external = l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
        return '<a class="social-link social-' + l.name.toLowerCase() + '" href="' + l.href +
               '" aria-label="' + l.name + '" title="' + l.name + '"' + external + '>' +
               '<svg viewBox="0 0 24 24" aria-hidden="true">' + l.icon + '</svg></a>';
      }).join("") +
    '</div>';
  document.body.appendChild(rail);
})();

/* ==========================================================
   DARK MODE: adds a moon/sun button at the end of the nav.
   Click it to switch between light and dark. Your choice is remembered
   on every page. The colors are in style.css, section 20.
   ========================================================== */
(function () {
  const KEY = "theme";
  const root = document.documentElement;

  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  root.dataset.theme = load() === "dark" ? "dark" : "light";

  const nav = document.querySelector("nav");
  if (!nav) return;

  const MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  const SUN  = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";

  /* shows a moon in light mode (click for dark) and a sun in dark mode (click for light) */
  function paint() {
    const dark = root.dataset.theme === "dark";
    const label = dark ? "Switch to light mode" : "Switch to dark mode";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (dark ? SUN : MOON) + "</svg>";
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  button.addEventListener("click", function () {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    save(root.dataset.theme);
    paint();
  });

  nav.appendChild(button);
  paint();
})();