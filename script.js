/* ==========================================================
   SCRIPT.JS: typewriter effect for the Home headline
   The headline writes itself, stays for a moment, erases, and repeats.
   It reads the text from the <h1> in index.html, so edit your words there.
   ========================================================== */

/* ---------- SETTINGS: change these numbers (1000 = 1 second) ---------- */
const TYPE_SPEED  = 90;    /* time per letter while writing */
const ERASE_SPEED = 45;    /* time per letter while erasing */
const HOLD_TIME   = 2200;  /* how long the full headline stays */
const PAUSE_TIME  = 600;   /* pause when the headline is empty */

const title = document.querySelector(".hero h1");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* does nothing on other pages, or for people who turned animations off */
if (title && !reduceMotion) {

  /* ---------- CARET (the blinking line) STYLE: edit here ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .hero h1 .char { position: relative; color: transparent; }
    .hero h1 .char.visible { color: inherit; }
    .hero h1 .caret-after::after,
    .hero h1 .caret-before::before {
      content: "";
      position: absolute;
      top: 8%;
      height: 84%;
      width: 0.06em;
      background: var(--text);
      animation: caret-blink 0.9s steps(1) infinite;
    }
    .hero h1 .caret-after::after  { right: -0.05em; }
    .hero h1 .caret-before::before { left: -0.05em; }
    @keyframes caret-blink { 50% { opacity: 0; } }
  `;
  document.head.appendChild(style);

  /* ---------- turn every letter into its own span ----------
     All letters stay in place (just hidden), so the headline never
     jumps around while it is being written. */
  title.setAttribute("aria-label", title.innerText.replace(/\s+/g, " ").trim());

  const chars = [];
  const nodes = Array.from(title.childNodes);
  title.textContent = "";

  nodes.forEach((node, index) => {
    if (node.nodeType !== Node.TEXT_NODE) {
      title.appendChild(node);          /* keeps things like <br> as they are */
      return;
    }
    let text = node.textContent.replace(/\s+/g, " ");
    if (index === 0) text = text.trimStart();
    if (index === nodes.length - 1) text = text.trimEnd();
    for (const letter of text) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = letter;
      span.setAttribute("aria-hidden", "true");
      title.appendChild(span);
      chars.push(span);
    }
  });

  /* ---------- show the first "shown" letters and put the caret after them ---------- */
  let shown = 0;

  function render() {
    chars.forEach((char, i) => {
      char.classList.toggle("visible", i < shown);
      char.classList.remove("caret-after", "caret-before");
    });
    if (shown > 0) chars[shown - 1].classList.add("caret-after");
    else chars[0].classList.add("caret-before");
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function loop() {
    while (true) {
      for (shown = 1; shown <= chars.length; shown++) {      /* write */
        render();
        await wait(TYPE_SPEED);
      }
      shown = chars.length;
      render();
      await wait(HOLD_TIME);

      for (shown = chars.length - 1; shown >= 0; shown--) {  /* erase */
        render();
        await wait(ERASE_SPEED);
      }
      await wait(PAUSE_TIME);
    }
  }

  if (chars.length > 0) loop();
}

/* ==========================================================
   GLOW: the light that circles each nav link on hover
   This adds a small drawing inside every nav link. The look is in
   style.css, section 8c. This file must be on EVERY page.
   ========================================================== */
document.querySelectorAll("nav a").forEach((link) => {
  link.classList.add("glow");
  link.insertAdjacentHTML(
    "beforeend",
    '<svg class="glow-container" aria-hidden="true">' +
      '<rect pathLength="100" stroke-linecap="round" class="glow-blur"></rect>' +
      '<rect pathLength="100" stroke-linecap="round" class="glow-line"></rect>' +
    "</svg>"
  );
});

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