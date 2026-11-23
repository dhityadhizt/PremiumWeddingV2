/**
 * Parallax Abstract Watercolor Splash Effect
 * - Berada 1 tingkat di atas layer background (z-index: 2, tepat di atas ::after z-index: 1)
 * - Efek parallax mengikuti arah pergeseran background saat di-scroll
 * - Palet warna referensi: biru dongker/navy, biru keabu-abuan lembut, dan aksen emas
 */
export class WatercolorSplash {
  constructor(options = {}) {
    this.colors = options.colors || ["#162A4A", "#2B4C7E", "#8EA4C0", "#C5A059"];
    this.splashImages = options.splashImages || [
      "src/assets/images/watercolor-abstract-1.png",
      "src/assets/images/watercolor-abstract-2.png",
      "src/assets/images/watercolor-abstract-3.png"
    ];
    this.sectionSelector =
      options.sectionSelector ||
      "main > section#bride, main > section.hadist, main > section.time, main > section.galeri, main > section.wishas";
    this.maxActivePerSection = options.maxActivePerSection ?? 5;
    this.spawnInterval = options.spawnInterval ?? 1200;
    this.minSize = options.minSize ?? 230;
    this.maxSize = options.maxSize ?? 430;
    this.minDuration = options.minDuration ?? 3600;
    this.maxDuration = options.maxDuration ?? 6000;
    // Faktor positif agar pergeseran parallax mengikuti arah gerak background saat scroll
    this.parallaxFactor = options.parallaxFactor ?? 0.35;
    this.blendMode = options.blendMode || "multiply"; // "multiply" | "screen"
    this.interactive = options.interactive ?? true;

    this.layers = [];
    this.items = [];
    this.timerId = null;
    this.rafId = null;
    this.loadedImages = new Map();
    this.tintedCache = new Map();

    this._onScroll = this._onScroll.bind(this);
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

  _setupLayers() {
    const sections = Array.from(document.querySelectorAll(this.sectionSelector));
    const targets = sections.length > 0 ? sections : [document.body];

    this.layers = targets.map((section) => {
      let container = section.querySelector(".watercolor-splash-container");
      if (!container) {
        container = document.createElement("div");
        container.className = "watercolor-splash-container";
        container.setAttribute("aria-hidden", "true");
        if (this.blendMode === "screen") {
          container.classList.add("blend-screen");
        }
        section.appendChild(container);
      }
      return { section, container };
    });
  }

  _updateParallax() {
    this.rafId = null;
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;

    for (const item of this.items) {
      if (!item.parallaxEl || !item.section) continue;
      const rect = item.section.getBoundingClientRect();
      // Ketika halaman di-scroll ke bawah, section bergerak ke atas (rect.top berkurang).
      // Nilai deltaFromCenter bernilai positif saat section bergeser ke atas, sehingga parallaxFactor positif
      // menggeser splash mengikuti arah pergerakan background secara halus.
      const sectionCenter = rect.top + rect.height * 0.5;
      const deltaFromCenter = vh * 0.5 - sectionCenter;
      const offsetPx = deltaFromCenter * this.parallaxFactor * item.speedMultiplier;
      item.parallaxEl.style.setProperty("--parallax-y", `${offsetPx.toFixed(1)}px`);
    }
  }

  _onScroll() {
    if (!this.rafId) {
      this.rafId = window.requestAnimationFrame(this._updateParallax.bind(this));
    }
  }

  _onPointerDown(event) {
    if (!this.layers.length) return;
    const targetLayer = this.layers.find(({ section }) => section.contains(event.target));
    if (!targetLayer) return;

    const rect = targetLayer.container.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    this.spawnSplash(targetLayer, localX, localY, true);
  }

  spawnSplash(layerObj, x = null, y = null, isTap = false) {
    if (!layerObj || !layerObj.container) return;

    const currentCount = layerObj.container.childElementCount;
    const cap = isTap ? this.maxActivePerSection + 3 : this.maxActivePerSection;
    if (currentCount >= cap) return;

    const validEntries = this.splashImages
      .map((src) => ({ src, img: this.loadedImages.get(src) }))
      .filter((entry) => Boolean(entry.img));

    if (validEntries.length === 0) return;

    const chosen = validEntries[Math.floor(Math.random() * validEntries.length)];
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const tintedSrc = this._getTintedDataUrl(chosen.img, chosen.src, color);

    const width = layerObj.container.clientWidth || window.innerWidth;
    const height = layerObj.container.clientHeight || 500;

    const posX = x ?? Math.random() * width;
    const posY = y ?? Math.random() * height;

    const size = isTap
      ? this.minSize * 0.72 + Math.random() * (this.maxSize - this.minSize) * 0.6
      : this.minSize + Math.random() * (this.maxSize - this.minSize);

    const duration = this.minDuration + Math.random() * (this.maxDuration - this.minDuration);
    const rotation = `${Math.floor(Math.random() * 360)}deg`;
    const maxScale = (0.95 + Math.random() * 0.35).toFixed(2);
    const isLightOrGold = ["#8EA4C0", "#C5A059"].includes(color.toUpperCase());
    const peakOpacity = isLightOrGold ? "0.56" : "0.44";
    const midOpacity = isLightOrGold ? "0.36" : "0.28";
    const speedMultiplier = (0.8 + Math.random() * 0.5).toFixed(2);

    const parallaxWrapper = document.createElement("div");
    parallaxWrapper.className = "watercolor-splash-parallax";
    parallaxWrapper.style.setProperty("--splash-x", `${posX}px`);
    parallaxWrapper.style.setProperty("--splash-y", `${posY}px`);
    parallaxWrapper.style.setProperty("--splash-size", `${size}px`);
    parallaxWrapper.style.setProperty("--parallax-y", "0px");

    const splashEl = document.createElement("div");
    splashEl.className = "watercolor-splash";
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
    parallaxWrapper.appendChild(splashEl);
    layerObj.container.appendChild(parallaxWrapper);

    const entryRecord = {
      section: layerObj.section,
      parallaxEl: parallaxWrapper,
      speedMultiplier: parseFloat(speedMultiplier)
    };
    this.items.push(entryRecord);

    this._updateParallax();

    window.setTimeout(() => {
      parallaxWrapper.remove();
      const idx = this.items.indexOf(entryRecord);
      if (idx !== -1) {
        this.items.splice(idx, 1);
      }
    }, duration + 60);
  }

  async init() {
    if (this.layers.length > 0) return;

    this._setupLayers();
    await this._preloadImages();

    for (const layerObj of this.layers) {
      const initialCount = Math.min(2, this.maxActivePerSection);
      for (let i = 0; i < initialCount; i++) {
        this.spawnSplash(layerObj);
      }
    }

    this.timerId = window.setInterval(() => {
      for (const layerObj of this.layers) {
        if (layerObj.container.childElementCount < this.maxActivePerSection) {
          this.spawnSplash(layerObj);
        }
      }
    }, this.spawnInterval);

    window.addEventListener("scroll", this._onScroll, { passive: true });
    if (this.interactive) {
      document.addEventListener("pointerdown", this._onPointerDown, { passive: true });
    }
  }

  destroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener("scroll", this._onScroll);
    document.removeEventListener("pointerdown", this._onPointerDown);
    for (const { container } of this.layers) {
      container.remove();
    }
    this.layers = [];
    this.items = [];
  }
}

function startWatercolorSplash() {
  const splashEffect = new WatercolorSplash({
    colors: ["#162A4A", "#2B4C7E", "#8EA4C0", "#C5A059"],
    splashImages: [
      "src/assets/images/watercolor-abstract-1.png",
      "src/assets/images/watercolor-abstract-2.png",
      "src/assets/images/watercolor-abstract-3.png"
    ],
    maxActivePerSection: 5,
    spawnInterval: 1200,
    minSize: 230,
    maxSize: 430,
    parallaxFactor: 0.35,
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
