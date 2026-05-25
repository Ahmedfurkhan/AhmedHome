/**
 * hexGrid.js
 * Interactive honeycomb project showcase built on HTML5 Canvas.
 * Flat-top hexagon layout with image fill, hover glow, and click navigation.
 */

export class HexGrid {
  /**
   * @param {string} canvasId  - ID of the <canvas> element
   * @param {Array}  projects  - Array of { title, image, url } objects
   */
  constructor(canvasId, projects) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.projects = projects;
    this.hexes = [];
    this.images = [];
    this.hoveredIndex = -1;
    this.hexRadius = 100; // circumradius in px
    this.gap = 8;

    this.init();
  }

  async init() {
    await this.loadImages();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("mouseleave", () => {
      this.hoveredIndex = -1;
      this.canvas.style.cursor = "default";
      this.draw();
    });
  }

  /** Pre-load all project thumbnail images. */
  loadImages() {
    const promises = this.projects.map(
      (p, i) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.images[i] = img;
            resolve();
          };
          img.onerror = () => {
            this.images[i] = null;
            resolve();
          };
          img.src = p.image;
        }),
    );
    return Promise.all(promises);
  }

  /** Recalculate grid dimensions and positions when viewport changes. */
  resize() {
    const container = this.canvas.parentElement;
    const w = container.clientWidth;
    this.canvas.width = w;

    const colSpacing = Math.sqrt(3) * this.hexRadius + this.gap;
    const cols = Math.max(2, Math.floor(w / colSpacing));
    const rows = Math.ceil(this.projects.length / cols);
    const rowSpacing = 1.5 * this.hexRadius + this.gap;

    this.canvas.height =
      rows * rowSpacing + 0.5 * this.hexRadius + this.gap * 2;

    this.hexes = [];
    for (let i = 0; i < this.projects.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x =
        col * colSpacing +
        (row % 2 === 1 ? colSpacing / 2 : 0) +
        this.hexRadius;
      const y = row * rowSpacing + this.hexRadius + this.gap;
      this.hexes.push({ x, y, r: this.hexRadius, project: this.projects[i] });
    }

    this.draw();
  }

  /**
   * Trace a flat-top regular hexagon path.
   * Vertices at 0°, 60°, 120°, 180°, 240°, 300°.
   */
  hexPath(x, y, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  /** Render all hexagons onto the canvas. */
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.hexes.forEach((hex, i) => {
      const hovered = i === this.hoveredIndex;

      /* ── Image fill inside hex clip ── */
      ctx.save();
      this.hexPath(hex.x, hex.y, hex.r);
      ctx.clip();

      if (this.images[i]) {
        ctx.drawImage(
          this.images[i],
          hex.x - hex.r,
          hex.y - hex.r,
          hex.r * 2,
          hex.r * 2,
        );
      } else {
        /* Fallback gradient when image is unavailable */
        const grad = ctx.createRadialGradient(
          hex.x,
          hex.y,
          0,
          hex.x,
          hex.y,
          hex.r,
        );
        grad.addColorStop(0, "#1e3a5f");
        grad.addColorStop(1, "#0d1b2a");
        ctx.fillStyle = grad;
        this.hexPath(hex.x, hex.y, hex.r);
        ctx.fill();
      }

      /* Darkening overlay so text stays readable */
      const overlay = ctx.createLinearGradient(
        hex.x,
        hex.y - hex.r,
        hex.x,
        hex.y + hex.r,
      );
      overlay.addColorStop(0, "rgba(0,0,0,0.1)");
      overlay.addColorStop(
        1,
        hovered ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.72)",
      );
      this.hexPath(hex.x, hex.y, hex.r);
      ctx.fillStyle = overlay;
      ctx.fill();

      ctx.restore();

      /* ── Border ── */
      if (hovered) {
        ctx.save();
        ctx.shadowColor = "#18bfef";
        ctx.shadowBlur = 24;
        this.hexPath(hex.x, hex.y, hex.r);
        ctx.strokeStyle = "#18bfef";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      } else {
        this.hexPath(hex.x, hex.y, hex.r);
        ctx.strokeStyle = "rgba(24, 191, 239, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      /* ── Label ── */
      const fontSize = Math.round(hex.r * 0.19);
      ctx.font = `${hovered ? "700" : "500"} ${fontSize}px 'Segoe UI', sans-serif`;
      ctx.fillStyle = hovered ? "#18bfef" : "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      /* Word-wrap: break title into up to 2 lines */
      const words = hex.project.title.split(" ");
      const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
      const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
      const lineH = fontSize * 1.4;
      const yBase = hex.y + hex.r * 0.52 - (line2 ? lineH / 2 : 0);

      ctx.fillText(line1, hex.x, yBase, hex.r * 1.6);
      if (line2) ctx.fillText(line2, hex.x, yBase + lineH, hex.r * 1.6);

      /* Hover hint arrow */
      if (hovered) {
        ctx.font = `${Math.round(hex.r * 0.22)}px sans-serif`;
        ctx.fillStyle = "#18bfef";
        ctx.fillText("↗", hex.x, hex.y - hex.r * 0.38);
      }
    });
  }

  /** Return the hex index that contains screen point (mx, my), or -1. */
  hitTest(mx, my) {
    for (let i = 0; i < this.hexes.length; i++) {
      const { x, y, r } = this.hexes[i];
      if (Math.hypot(mx - x, my - y) <= r * 0.95) return i;
    }
    return -1;
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const idx = this.hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (idx !== this.hoveredIndex) {
      this.hoveredIndex = idx;
      this.canvas.style.cursor = idx >= 0 ? "pointer" : "default";
      this.draw();
    }
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const idx = this.hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (idx >= 0 && this.projects[idx].url) {
      window.open(this.projects[idx].url, "_blank", "noopener,noreferrer");
    }
  }
}
