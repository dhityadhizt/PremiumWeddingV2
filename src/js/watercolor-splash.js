/**
 * Abstract Watercolor Splash Effect
 * Palet: ["#000000", "#FFFFFF", "#4169E1"]
 * Menggunakan PNG transparan berbentuk percikan cat air abstrak berserakan.
 */
export class WatercolorSplash {
  constructor(options = {}) {
    this.colors = options.colors || ["#000000", "#FFFFFF", "#4169E1"];
    this.splashImages = options.splashImages || [
      "src/assets/images/watercolor-abstract-1.png",
      "src/assets/images/watercolor-abstract-2.png",
      "src/assets/images/watercolor-abstract-3.png"
    ];
    this.maxActive = options.maxActive ?? 10;
    this.spawnInterval = options.spawnInterval ?? 1150;
    this.minSize = options.minSize ?? 130;
    this.maxSize = options.maxSize ?? 260;
    this.minDuration = options.minDuration ?? 3400;
    this.maxDuration = options.maxDuration ?? 5800;
    this.blendMode = options.blendMode || "multiply"; // "multiply" | "screen"
    this.interactive = options.interactive ?? true;

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

    const initialCount = Math.min(3, this.maxActive);
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
    if (this.container.childElementCount >= this.maxActive + 4) return;
    this.spawnSplash(event.clientX, event.clientY, true);
  }

  _createSplashElement(color) {
    const imgSrc = this.splashImages[Math.floor(Math.random() * this.splashImages.length)];
    const tintEl = document.createElement("div");
    tintEl.className = "watercolor-splash-tint";
    tintEl.style.setProperty("--splash-color", color);
    tintEl.style.setProperty("--splash-mask", `url("${imgSrc}")`);
    return tintEl;
  }

  spawnSplash(x = null, y = null, isTap = false) {
    if (!this.container) return;

    const posX = x ?? Math.random() * window.innerWidth;
    const posY = y ?? Math.random() * window.innerHeight;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    const size = isTap
      ? this.minSize * 0.72 + Math.random() * (this.maxSize - this.minSize) * 0.6
      : this.minSize + Math.random() * (this.maxSize - this.minSize);

    const duration = this.minDuration + Math.random() * (this.maxDuration - this.minDuration);
    const rotation = `${Math.floor(Math.random() * 360)}deg`;
    const maxScale = (0.95 + Math.random() * 0.35).toFixed(2);
    const isWhite = color.toUpperCase() === "#FFFFFF";
    const peakOpacity = isWhite ? "0.62" : "0.42";
    const midOpacity = isWhite ? "0.40" : "0.26";

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

    splashEl.appendChild(this._createSplashElement(color));
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
    splashImages: [
      "src/assets/images/watercolor-abstract-1.png",
      "src/assets/images/watercolor-abstract-2.png",
      "src/assets/images/watercolor-abstract-3.png"
    ],
    maxActive: 10,
    spawnInterval: 1150,
    blendMode: "multiply",
    interactive: true
  });
  splashEffect.init();
});
