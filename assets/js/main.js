/**
 * main.js — Massively theme, vanilla ES6 module
 * Import chain:  HTML → main.js (module) → util.js (module)
 */

import { navList } from "./util.js";

/* Tiny DOM helpers   */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/*  
   1. Breakpoints
   Initialises the global breakpoints object (from breakpoints.min.js).
   */
breakpoints({
  default: ["1681px", null],
  xlarge: ["1281px", "1680px"],
  large: ["981px", "1280px"],
  medium: ["737px", "980px"],
  small: ["481px", "736px"],
  xsmall: ["361px", "480px"],
  xxsmall: [null, "360px"],
});

/*  
   2. Remove preload overlay
   The CSS keeps everything invisible while body.is-preload is set.
   We remove it 100 ms after the page has fully loaded.
   */
window.addEventListener("load", () => {
  setTimeout(() => document.body.classList.remove("is-preload"), 100);
});

/*  
   3. Smooth scroll — .scrolly links
   Any anchor with class .scrolly smooth-scrolls to its #target.
   */
$$(".scrolly").forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href?.startsWith("#")) return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

/* 
   4. Parallax background — #wrapper
   Creates a .bg child div inside #wrapper and translates it on
   scroll to produce a parallax effect.  Disabled on mobile, IE,
   Edge, and HiDPI screens (matches original behaviour).
   */
(function initParallax() {
  const wrapper = $("#wrapper");
  if (!wrapper) return;

  // Bail on platforms where parallax is janky or unsupported.
  if (
    browser.mobile ||
    browser.name === "ie" ||
    browser.name === "edge" ||
    window.devicePixelRatio > 1
  )
    return;

  const INTENSITY = 0.925;
  const bg = document.createElement("div");
  bg.className = "bg";
  wrapper.appendChild(bg);

  const onScroll = () => {
    const pos = window.scrollY - wrapper.offsetTop;
    bg.style.transform = `matrix(1,0,0,1,0,${pos * INTENSITY})`;
  };

  // Enable on large screens; disable (fixed bg) on smaller ones.
  breakpoints.on(">large", () => {
    bg.classList.remove("fixed");
    bg.style.transform = "";
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // apply immediately
  });

  breakpoints.on("<=large", () => {
    bg.classList.add("fixed");
    bg.style.transform = "none";
    window.removeEventListener("scroll", onScroll);
  });

  // Re-trigger scroll on resize so position stays accurate.
  window.addEventListener(
    "resize",
    () => window.dispatchEvent(new Event("scroll")),
    { passive: true },
  );
})();

/* 
   5. Mobile nav panel
   Dynamically creates #navPanelToggle (Menu button) and #navPanel
   (slide-out drawer).  On ≤medium breakpoints the nav's children
   are moved into the panel; on >medium they move back to the nav.
 */
(function initNavPanel() {
  const nav = $("#nav");
  const wrapper = $("#wrapper");
  const header = $("#header");
  if (!nav || !wrapper) return;

  /*  Toggle button  */
  const toggle = document.createElement("a");
  toggle.href = "#navPanel";
  toggle.id = "navPanelToggle";
  toggle.textContent = "Menu";
  wrapper.appendChild(toggle);

  // Add .alt (dark style) when header has scrolled out of view.
  if (header) {
    new IntersectionObserver(
      ([entry]) => toggle.classList.toggle("alt", !entry.isIntersecting),
      { rootMargin: "-5% 0px 0px 0px" },
    ).observe(header);
  }

  /* Panel element  */
  const panel = document.createElement("div");
  panel.id = "navPanel";
  panel.innerHTML =
    '<nav id="navPanelInner"></nav>' + '<a href="#navPanel" class="close"></a>';
  document.body.appendChild(panel);

  const panelInner = panel.querySelector("nav");

  // Populate panel with a flat link list (uses util.navList).
  panelInner.innerHTML = navList(nav);

  /* Show / hide helpers */
  const showPanel = () => document.body.classList.add("is-navPanel-visible");
  const hidePanel = () => {
    document.body.classList.remove("is-navPanel-visible");
    // Reset panel scroll after transition.
    setTimeout(() => {
      panel.scrollTop = 0;
    }, 500);
  };

  /*  Move nav content between nav ↔ panel on breakpoint change ─
     We move the actual children rather than cloning so that active
     classes and event listeners are preserved.                    */
  const navChildren = [...nav.children];

  breakpoints.on(">medium", () => {
    // Panel → Nav.
    navChildren.forEach((c) => nav.appendChild(c));
    nav
      .querySelectorAll(".icons, .icon")
      .forEach((el) => el.classList.remove("alt"));
  });

  breakpoints.on("<=medium", () => {
    // Nav → Panel.
    navChildren.forEach((c) => panelInner.appendChild(c));
    panelInner
      .querySelectorAll(".icons, .icon")
      .forEach((el) => el.classList.add("alt"));
  });

  /*  Body click: open on toggle / close elsewhere */
  document.body.addEventListener("click", (e) => {
    // Open: any link pointing to #navPanel.
    if (e.target.closest('a[href="#navPanel"]')) {
      e.preventDefault();
      e.stopPropagation();
      showPanel();
      return;
    }
    // Close: click outside the panel.
    if (!e.target.closest("#navPanel")) {
      hidePanel();
    }
  });

  /* Panel click: navigate or close */
  panel.addEventListener("click", (e) => {
    e.stopPropagation();
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";

    if (href === "#navPanel" || href === "") {
      // Close button or non-link.
      e.preventDefault();
      hidePanel();
    } else {
      // Real navigation — close panel first, then redirect.
      e.preventDefault();
      hidePanel();
      setTimeout(() => {
        if (a.getAttribute("target") === "_blank") {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = href;
        }
      }, 510);
    }
  });

  /* Touch: swipe right-to-left to close */
  let touchStartX = null;
  panel.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].pageX;
    },
    { passive: true },
  );
  panel.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartX === null) return;
      const diff = touchStartX - e.touches[0].pageX;
      if (diff > 50) {
        hidePanel();
        touchStartX = null;
      }
    },
    { passive: true },
  );

  /* Keyboard: Escape to close  */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hidePanel();
  });
})();

/* 
   6. Intro section — hide / show on scroll
   Hides #intro by adding .hidden when the user scrolls far enough
   into #main.  Threshold matches the original scrollex config:
     >small  → hide when #main top < 25 vh from top
     ≤small  → hide when #main top < 15 vh from top
 */
(function initIntroScroll() {
  const intro = $("#intro");
  const main = $("#main");
  if (!intro || !main) return;

  const update = () => {
    const rect = main.getBoundingClientRect();
    const vh = window.innerHeight;
    const isSmall = breakpoints.active("<=small");
    const threshold = isSmall ? vh * 0.15 : vh * 0.25;

    intro.classList.toggle("hidden", rect.top < threshold);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
})();
