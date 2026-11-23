/**
 * Abstract Watercolor Splash Effect
 * Palet: ["#000000", "#FFFFFF", "#4169E1"]
 * Berada 1 tingkat di atas layer background (z-index: 3).
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
    this.spawnInterval = options.spawnInterval ?? 950;
    this.minSize = options.minSize ?? 130;
    this.maxSize = options.maxSize ?? 250;
    this.minDuration = options.minDuration ?? 3400;
    this.maxDuration = options.maxDuration ?? 5600;
    this.blendMode = options.blendMode || "multiply";
    this.interactive = options.interactive ?? true;

    this.container = null;
    this.timerId = null;
    this.loadedImages = new Map();
    this.tintedCache = new Map();
    this._onPointerDown = this._onPointerDown.bind(this);
  }

  _preloadImages() {
    return Promise.all(
      this.splashImages.map(
        (src) =>
          new Promise((resolve) => {
            if (this.loadedImages.has(src)) {
              resolve(this.loadedImages.get(src));
              return;
            }
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              this.loadedImages.set(src, img);
              resolve(img);
            };
            img.onerror = () => resolve(null);
            img.src = src;
          })
      )
    );
  }

  _getTintedDataUrl(img, src, color) {
    const cacheKey = `${src}__${color.toUpperCase()}`;
    if (this.tintedCache.has(cacheKey)) {
      return this.tintedCache.get(cacheKey);
    }

    const canvas = document.createElement("canvas");
    const w = img.naturalWidth || img.width || 300;
    const h = img.naturalHeight || img.height || 300;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    const url = canvas.toDataURL("image/png");
    this.tintedCache.set(cacheKey, url);
    return url;
  }

  async init() {
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

    await this._preloadImages();

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

  spawnSplash(x = null, y = null, isTap = false) {
    if (!this.container) return;

    const validEntries = this.splashImages
      .map((src) => ({ src, img: this.loadedImages.get(src) }))
      .filter((entry) => Boolean(entry.img));

    if (validEntries.length === 0) return;

    const chosen = validEntries[Math.floor(Math.random() * validEntries.length)];
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const tintedSrc = this._getTintedDataUrl(chosen.img, chosen.src, color);

    const posX = x ?? Math.random() * window.innerWidth;
    const posY = y ?? Math.random() * window.innerHeight;

    const size = isTap
      ? this.minSize * 0.72 + Math.random() * (this.maxSize - this.minSize) * 0.6
      : this.minSize + Math.random() * (this.maxSize - this.minSize);

    const duration = this.minDuration + Math.random() * (this.maxDuration - this.minDuration);
    const rotation = `${Math.floor(Math.random() * 360)}deg`;
    const maxScale = (0.95 + Math.random() * 0.35).toFixed(2);
    const isWhite = color.toUpperCase() === "#FFFFFF";
    const peakOpacity = isWhite ? "0.65" : "0.45";
    const midOpacity = isWhite ? "0.42" : "0.28";

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

    const imgEl = document.createElement("img");
    imgEl.src = tintedSrc;
    imgEl.alt = "";
    imgEl.decoding = "async";
    splashEl.appendChild(imgEl);

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

function startWatercolorSplash() {
  const splashEffect = new WatercolorSplash({
    colors: ["#000000", "#FFFFFF", "#4169E1"],
    splashImages: [
      "src/assets/images/watercolor-abstract-1.png",
      "src/assets/images/watercolor-abstract-2.png",
      "src/assets/images/watercolor-abstract-3.png"
    ],
    maxActive: 10,
    spawnInterval: 950,
    blendMode: "multiply",
    interactive: true
  });
  splashEffect.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startWatercolorSplash);
} else {
  startWatercolorSplash();
}
