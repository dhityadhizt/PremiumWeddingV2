/**
 * Interactive Watercolor Splash Effect
 * Palet: ["#000000", "#FFFFFF", "#4169E1"]
 * Mendukung bentuk organik SVG bawaan maupun gambar PNG transparan (splashImages).
 */
export class WatercolorSplash {
  constructor(options = {}) {
    this.colors = options.colors || ["#000000", "#FFFFFF", "#4169E1"];
    this.splashImages = options.splashImages || []; // Contoh: ["src/assets/images/splash1.png"]
    this.maxActive = options.maxActive ?? 14;
    this.spawnInterval = options.spawnInterval ?? 950;
    this.minSize = options.minSize ?? 90;
    this.maxSize = options.maxSize ?? 220;
    this.minDuration = options.minDuration ?? 3200;
    this.maxDuration = options.maxDuration ?? 5600;
    this.blendMode = options.blendMode || "multiply"; // "multiply" | "screen"
    this.interactive = options.interactive ?? true;

    this.organicPaths = [
      "M48.5,14.2C61.3,11.8,76.4,16.9,83.8,27.6C91.2,38.3,90.9,54.6,83.1,66.7C75.3,78.8,60,86.7,45.2,87.4C30.4,88.1,16.1,81.6,10.2,69.8C4.3,58,6.8,40.9,15.4,28.7C24,16.5,35.7,16.6,48.5,14.2Z",
      "M53.2,9.4C65.8,12.1,75.6,23.8,82.5,36.4C89.4,49,93.4,62.5,87.1,72.8C80.8,83.1,64.2,90.2,48.9,88.6C33.6,87,19.6,76.7,12.7,63.2C5.8,49.7,6,33,14.6,21.8C23.2,10.6,40.6,6.7,53.2,9.4Z",
      "M44.1,12.8C57.6,8.2,74.2,11.4,83.6,21.7C93,32,95.2,49.4,88.9,63.1C82.6,76.8,67.8,86.8,52.4,88.3C37,89.8,21,82.8,12.9,70.4C4.8,58,4.6,40.2,12.8,27.5C21,14.8,30.6,17.4,44.1,12.8Z",
      "M50.8,11.5C63.1,14.7,72.9,25.6,79.6,37.8C86.3,50,89.9,63.5,84.2,74.2C78.5,84.9,63.5,92.8,48.6,91.5C33.7,90.2,18.9,79.7,12.3,66.4C5.7,53.1,7.3,37,16.2,25.3C25.1,13.6,38.5,8.3,50.8,11.5Z"
    ];

    this.container = null;
    this.timerId = null;
    this._onPointerDown = this._onPointerDown.bind(this);
  }

  init() {
    if (this.container) return;

    const existing = document.querySelector(".watercolor-splash-container");
    if (existing) {
      this.container = existing;
    } else {
      const container = document.createElement("div");
      container.className = "watercolor-splash-container";
      container.setAttribute("aria-hidden", "true");
      if (this.blendMode === "screen") {
        container.classList.add("blend-screen");
      }
      document.body.appendChild(container);
      this.container = container;
    }

    const initialCount = Math.min(4, this.maxActive);
    for (let i = 0; i < initialCount; i++) {
      this.spawnSplash();
    }

    this.timerId = window.setInterval(() => {
      if (this.container && this.container.childElementCount < this.maxActive) {
        this.spawnSplash();
      }
    }, this.spawnInterval);

    if (this.interactive) {
      document.addEventListener("pointerdown", this._onPointerDown, { passive: true });
    }
  }

  _onPointerDown(event) {
    if (!this.container) return;
    if (this.container.childElementCount >= this.maxActive + 5) return;
    this.spawnSplash(event.clientX, event.clientY, true);
  }

  _createSplashVisual(color) {
    if (Array.isArray(this.splashImages) && this.splashImages.length > 0) {
      const imgSrc = this.splashImages[Math.floor(Math.random() * this.splashImages.length)];
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "";
      img.loading = "lazy";
      return img;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const pathD = this.organicPaths[Math.floor(Math.random() * this.organicPaths.length)];
    const filterId = `wc-bleed-${Math.random().toString(36).slice(2, 9)}`;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("aria-hidden", "true");

    const defs = document.createElementNS(svgNS, "defs");
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", filterId);
    filter.setAttribute("x", "-25%");
    filter.setAttribute("y", "-25%");
    filter.setAttribute("width", "150%");
    filter.setAttribute("height", "150%");

    const blur = document.createElementNS(svgNS, "feGaussianBlur");
    blur.setAttribute("stdDeviation", "2.6");
    filter.appendChild(blur);
    defs.appendChild(filter);
    svg.appendChild(defs);

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", color);
    path.setAttribute("filter", `url(#${filterId})`);
    svg.appendChild(path);

    return svg;
  }

  spawnSplash(x = null, y = null, isTap = false) {
    if (!this.container) return;

    const posX = x ?? Math.random() * window.innerWidth;
    const posY = y ?? Math.random() * window.innerHeight;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    const size = isTap
      ? this.minSize * 0.75 + Math.random() * (this.maxSize - this.minSize) * 0.65
      : this.minSize + Math.random() * (this.maxSize - this.minSize);

    const duration = this.minDuration + Math.random() * (this.maxDuration - this.minDuration);
    const rotation = `${Math.floor(Math.random() * 360)}deg`;
    const maxScale = (0.95 + Math.random() * 0.4).toFixed(2);
    const isWhite = color.toUpperCase() === "#FFFFFF";
    const peakOpacity = isWhite ? "0.55" : "0.36";
    const midOpacity = isWhite ? "0.35" : "0.22";

    const splashEl = document.createElement("div");
    splashEl.className = "watercolor-splash";
    splashEl.style.left = `${posX}px`;
    splashEl.style.top = `${posY}px`;
    splashEl.style.width = `${size}px`;
    splashEl.style.height = `${size}px`;
    splashEl.style.setProperty("--splash-rot", rotation);
    splashEl.style.setProperty("--splash-scale", maxScale);
    splashEl.style.setProperty("--splash-peak-opacity", peakOpacity);
    splashEl.style.setProperty("--splash-mid-opacity", midOpacity);
    splashEl.style.animation = `watercolorSpread ${duration}ms cubic-bezier(0.22, 0.85, 0.36, 1) forwards`;

    splashEl.appendChild(this._createSplashVisual(color));
    this.container.appendChild(splashEl);

    window.setTimeout(() => {
      splashEl.remove();
    }, duration + 60);
  }

  destroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    document.removeEventListener("pointerdown", this._onPointerDown);
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const splashEffect = new WatercolorSplash({
    colors: ["#000000", "#FFFFFF", "#4169E1"],
    splashImages: [], // Masukkan daftar URL/path PNG transparan jika ingin memakai gambar bercak cat air
    maxActive: 14,
    spawnInterval: 950,
    blendMode: "multiply",
    interactive: true
  });
  splashEffect.init();
});
