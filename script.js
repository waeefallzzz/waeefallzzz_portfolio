const TYPE_SPEED  = 90;
const ERASE_SPEED = 45;
const HOLD_TIME   = 1800;
const PAUSE_TIME  = 500;

const title = document.querySelector(".hero-hello");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (title && !reduceMotion) {

  const words = (title.dataset.words || title.textContent)
    .split("|").map((w) => w.trim()).filter(Boolean);

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
        title.classList.toggle("is-name", i > 0);

        for (let n = 1; n <= words[i].length; n++) {
          text.textContent = words[i].slice(0, n);
          await wait(TYPE_SPEED);
        }
        await wait(HOLD_TIME);

        for (let n = words[i].length - 1; n >= 0; n--) {
          text.textContent = words[i].slice(0, n);
          await wait(ERASE_SPEED);
        }
        await wait(PAUSE_TIME);
      }
    }
  }

  loop();
}

(function () {
  const SCRAMBLE_TIME = 600;
  const SETTLE_STEP   = 70;
  const RANDOM_LETTERS = "abcdefghijklmnopqrstuvwxyz0123456789#@$%&*?";

  const logo = document.querySelector(".logo");
  const logoText = logo ? logo.querySelector("span") : null;
  if (!logo || !logoText || reduceMotion) return;

  const original = logoText.textContent.trim();
  const randomChar = () => RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)];

  logo.setAttribute("aria-label", original);
  logoText.setAttribute("aria-hidden", "true");

  let timer = null;

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

(function () {
  const LEAVE_TIME = 350;

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) document.body.classList.remove("page-leave");
  });

  if (reduceMotion) return;

  document.querySelectorAll("a[href]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      if (link.protocol !== location.protocol || link.host !== location.host) return;
      if (link.pathname === location.pathname) return;

      e.preventDefault();
      document.body.classList.add("page-leave");
      setTimeout(function () { window.location.href = link.href; }, LEAVE_TIME);
    });
  });
})();

(function () {
  const links = [
    { name: "GitHub",   href: "https://github.com/yourname",
      icon: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>' },
    { name: "LinkedIn", href: "https://linkedin.com/in/yourname",
      icon: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>' },
    { name: "Email",    href: "mailto:you@email.com",
      icon: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>' }
  ];

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

(function () {
  const cards = document.querySelectorAll(".feat");
  const modal = document.getElementById("feat-modal");
  if (!cards.length || !modal) return;

  const panel = modal.querySelector(".showcase-panel");
  const tag = modal.querySelector(".feat-modal-tag");
  const heading = modal.querySelector(".feat-modal-title");
  const body = modal.querySelector(".feat-modal-body");
  const closeBtn = modal.querySelector(".showcase-close");
  let lastCard = null;

  function openModal(card) {
    const more = card.querySelector(".feat-more");
    const tools = card.querySelector(".feat-tools");

    tag.textContent = card.querySelector(".feat-tag").textContent;
    heading.textContent = card.querySelector("h3").textContent;
    body.innerHTML = more ? more.innerHTML : "";
    if (tools) body.insertBefore(tools.cloneNode(true), body.querySelector(".feat-source"));

    panel.scrollTop = 0;
    lastCard = card;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { closeBtn.focus(); }, 50);
  }

  function closeModal() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastCard) lastCard.focus();
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () { openModal(card); });
    card.addEventListener("keydown", function (e) {
      if (e.target !== card || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      openModal(card);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
})();

(function () {
  const ACCESS_KEY = "80f3fe8b-9b1e-4d3a-8193-96325f3493a9";

  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  /* ---------- overlay ---------- */
  const CHECK = '<polyline points="20 6 9 17 4 12"/>';
  const CROSS = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';

  const css = document.createElement("style");
  css.textContent = `
    .sent-overlay {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
      background: rgba(10, 10, 10, 0.55);
      backdrop-filter: blur(4px);
      opacity: 0; visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s;
    }
    .sent-overlay.open { opacity: 1; visibility: visible; }
    .sent-card {
      width: 100%; max-width: 380px;
      padding: 2rem 1.75rem 1.75rem;
      text-align: center;
      background: var(--bg, #fff);
      color: var(--text, #111);
      border: 1px solid rgba(128, 128, 128, 0.25);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      transform: translateY(14px) scale(0.97);
      transition: transform 0.3s ease;
    }
    :root[data-theme="dark"] .sent-card { background: var(--bg, #161616); color: var(--text, #f2f2f2); }
    .sent-overlay.open .sent-card { transform: none; }
    .sent-icon {
      width: 56px; height: 56px; margin: 0 auto 1rem;
      display: grid; place-items: center;
      border-radius: 50%;
      background: var(--accent, #4f46e5); color: #fff;
    }
    .sent-overlay.error .sent-icon { background: #d64545; }
    .sent-icon svg {
      width: 26px; height: 26px; fill: none; stroke: currentColor;
      stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
    }
    .sent-card h3 { margin: 0 0 0.5rem; font-size: 1.25rem; }
    .sent-card p  { margin: 0 0 1.5rem; opacity: 0.8; line-height: 1.5; }
    @media (prefers-reduced-motion: reduce) {
      .sent-overlay, .sent-card { transition: none; }
    }
  `;
  document.head.appendChild(css);

  const overlay = document.createElement("div");
  overlay.className = "sent-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="sent-card" role="alertdialog" aria-modal="true" aria-labelledby="sent-title" aria-describedby="sent-text">' +
      '<div class="sent-icon"><svg viewBox="0 0 24 24" aria-hidden="true"></svg></div>' +
      '<h3 id="sent-title"></h3>' +
      '<p id="sent-text"></p>' +
      '<button type="button" class="button sent-close">Close</button>' +
    '</div>';
  document.body.appendChild(overlay);

  const iconSvg  = overlay.querySelector(".sent-icon svg");
  const titleEl  = overlay.querySelector("#sent-title");
  const textEl   = overlay.querySelector("#sent-text");
  const closeBtn = overlay.querySelector(".sent-close");
  let autoClose = null;

  function showOverlay(ok, heading, message) {
    overlay.classList.toggle("error", !ok);
    iconSvg.innerHTML = ok ? CHECK : CROSS;
    titleEl.textContent = heading;
    textEl.textContent = message;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { closeBtn.focus(); }, 50);

    clearTimeout(autoClose);
    if (ok) autoClose = setTimeout(hideOverlay, 5000);
  }

  function hideOverlay() {
    if (!overlay.classList.contains("open")) return;
    clearTimeout(autoClose);
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", hideOverlay);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) hideOverlay(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideOverlay(); });

  /* ---------- submit ---------- */
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("access_key", ACCESS_KEY);
    formData.append("subject", "New message from " + formData.get("name"));
    formData.append("from_name", "Portfolio Contact Form");

    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    note.textContent = "";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (response.ok && data.success) {
        form.reset();
        showOverlay(true, "Message sent", "Thanks for reaching out. I'll get back to you soon.");
      } else {
        showOverlay(false, "Couldn't send", data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      showOverlay(false, "Couldn't send", "Network error. Please check your connection and try again.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
})();

(function () {
  const chips = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  if (!chips.length) return;

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const value = chip.dataset.filter;

      chips.forEach(function (c) {
        const on = c === chip;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on);
      });

      cards.forEach(function (card) {
        card.hidden = value !== "all" && card.dataset.category !== value;
      });
    });
  });
})();

/* Scroll reveal: minimal fade + slide, staggered, runs once per element */
(function () {
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const DURATION = 900;   // keep in sync with the CSS transition
  const STAGGER  = 90;    // ms between siblings
  const MAX_STEP = 5;     // cap so long lists don't lag

  const groups = [
    // [selector, direction]
    [".page-banner",                 "up"],
    [".intro-main",                  "left"],
    [".hero-details .detail",        "right"],
    [".sub-title",                   "left"],
    [".strip-grid figure",           "up"],
    [".focus-item",                  "up"],
    [".now-item",                    "up"],
    [".closing",                     "up"],
    [".pf-hero, .about-head",        "up"],
    [".about-photo",                 "left"],
    [".about-cols > div",            "up"],
    [".pf-facts > div",              "up"],
    [".cv-row",                      "right"],
    [".skill-row",                   "up"],
    [".filter-bar",                  "up"],
    [".feat",                        "up"],
    [".contact-form",                "left"],
    [".contact-list",                "right"],
    [".contact-resume",              "up"]
  ];

  const seen = new Set();
  const targets = [];

  groups.forEach(function (g) {
    document.querySelectorAll(g[0]).forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);

      // stagger among already-tagged siblings of the same parent
      const step = targets.filter(function (t) { return t.parent === el.parentElement; }).length;
      el.classList.add("reveal");
      if (g[1] !== "up") el.classList.add("reveal-" + g[1]);
      el.style.setProperty("--d", (Math.min(step, MAX_STEP) * STAGGER) + "ms");
      targets.push({ el: el, parent: el.parentElement, step: Math.min(step, MAX_STEP) });
    });
  });

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      el.classList.add("is-in");

      // hand the element back to its normal CSS (hover transforms etc.)
      const delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
      setTimeout(function () {
        el.classList.remove("reveal", "reveal-left", "reveal-right", "is-in");
        el.style.removeProperty("--d");
      }, delay + DURATION + 100);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  targets.forEach(function (t) { io.observe(t.el); });
})();