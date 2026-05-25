/**
 * util.js — Massively theme utilities, vanilla ES6 module
 * Exports: navList, prioritize
 */

/**
 * Generate a flat, indented list of anchor tags from a nav element.
 * Walks all <a> tags inside navEl and returns an HTML string suitable
 * for injecting into the mobile nav panel.
 *
 * @param {HTMLElement} navEl  The nav (or any container) to scan.
 * @returns {string}           HTML string of <a class="link depth-N"> tags.
 */
export function navList(navEl) {
  const anchors = navEl.querySelectorAll("a");

  return [...anchors]
    .map((a) => {
      // Depth = number of ancestor <li> elements minus 1 (0-indexed).
      let depth = 0;
      let node = a.parentElement;
      while (node && node !== navEl) {
        if (node.tagName === "LI") depth++;
        node = node.parentElement;
      }
      depth = Math.max(0, depth - 1);

      const href = a.getAttribute("href") || "";
      const target = a.getAttribute("target") || "";

      return (
        `<a class="link depth-${depth}"` +
        (target ? ` target="${target}"` : "") +
        (href ? ` href="${href}"` : "") +
        `><span class="indent-${depth}"></span>${a.textContent.trim()}</a>`
      );
    })
    .join("");
}

/**
 * Moves elements to / from the first position of their parent element.
 * Mirrors the behaviour of the original jQuery $.prioritize helper.
 *
 * @param {NodeList|string} elements  Elements or a CSS selector string.
 * @param {boolean}         condition If true, move elements to top of parent;
 *                                    if false, move them back to original position.
 */
export function prioritize(elements, condition) {
  const STORE_KEY = "_prioritizePrev";

  const els =
    typeof elements === "string"
      ? [...document.querySelectorAll(elements)]
      : [...elements];

  els.forEach((el) => {
    const prev = el[STORE_KEY];

    if (!prev) {
      // Not yet moved.
      if (!condition) return;

      const previousSibling = el.previousElementSibling;
      if (!previousSibling) return; // already at top

      el.parentElement.insertBefore(el, el.parentElement.firstElementChild);
      el[STORE_KEY] = previousSibling;
    } else {
      // Already moved — put it back.
      if (condition) return;

      prev.insertAdjacentElement("afterend", el);
      delete el[STORE_KEY];
    }
  });
}
