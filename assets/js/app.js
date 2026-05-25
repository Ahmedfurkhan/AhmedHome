import { HexGrid } from "./hexGrid.js";

//  1. TYPING EFFECT
//  Cycles through an array of role strings with a blinking cursor.
function initTypingEffect(elementId, phrases, speed = 70) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const current = phrases[phraseIndex];
    el.textContent = isDeleting
      ? current.slice(0, charIndex--)
      : current.slice(0, charIndex++);

    if (!isDeleting && charIndex > current.length) {
      isDeleting = true;
      setTimeout(tick, 1800);
      return;
    }
    if (isDeleting && charIndex < 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(tick, isDeleting ? speed / 2 : speed);
  }

  tick();
}

//  2. CHATBOT TOGGLE
//  Shows / hides the Dialogflow iframe on chatbot icon click.
function initChatbot() {
  const icon = document.getElementById("chatbotIcon");
  const iframe = document.getElementById("chatIframe");
  if (!icon || !iframe) return;

  iframe.style.display = "none";

  icon.addEventListener("click", () => {
    const hidden =
      iframe.style.display === "none" || iframe.style.display === "";
    iframe.style.display = hidden ? "block" : "none";
  });
}

//  3. BACK-TO-TOP BUTTON
//  Fades in after 400 px of scroll; smooth-scrolls to top on click.
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("visible", window.scrollY > 400),
    { passive: true },
  );

  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

//  4. SKILLS CATEGORY FILTER
//  Clicking a filter button shows only the matching skill section.
function initSkillFilter() {
  const buttons = document.querySelectorAll(".skill-filter-btn");
  const sections = document.querySelectorAll(".skill-section[data-category]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.target;
      sections.forEach((sec) => {
        sec.style.display =
          target === "all" || sec.dataset.category === target ? "" : "none";
      });
    });
  });
}

//  5. HEX GRID  (Projects page only)
//  Instantiates the canvas-based honeycomb if the canvas exists.

function initHexGrid() {
  if (!document.getElementById("hexCanvas")) return;

  const projects = [
    {
      title: "Ahmed Chatbot",
      image: "images/ahmedchatbot.png",
      url: "https://huggingface.co/spaces/ahmedfurkhan98/ahmedchatbot",
    },
    {
      title: "MultiDisease AI",
      image: "images/multi.png",
      url: "https://multidi.streamlit.app/",
    },
    {
      title: "Depression Detection",
      image: "images/depressio.png",
      url: "https://depressio-io.onrender.com/",
    },
    {
      title: "Ahmed PdfReader",
      image: "images/ahmedpdf.png",
      url: "https://huggingface.co/spaces/ahmedfurkhan98/AhmedPdfReader",
    },
  ];

  new HexGrid("hexCanvas", projects);
}

/* ─────────────────────────────────────────────────────────────────
   BOOTSTRAP — run everything after DOM is ready
───────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initTypingEffect("typingText", [
    "AI / ML Engineer",
    "Full-Stack Developer",
    "NLP Researcher",
    "Open Source Enthusiast",
  ]);
  initChatbot();
  initBackToTop();
  initSkillFilter();
  initHexGrid();
});
