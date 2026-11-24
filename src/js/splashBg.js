export function splashBg() {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const existing = mainEl.querySelector('.splash-layer');
    if (existing) existing.remove();

    const canvas = document.createElement('canvas');
    canvas.className = 'splash-layer';
    canvas.setAttribute('aria-hidden', 'true');
    mainEl.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Palet warna: Royal Blue, Putih, Hitam, Emas
    const palette = [
        { type: 'blue', rgb: '24, 90, 219', soft: '65, 138, 255' },
        { type: 'blue', rgb: '15, 62, 168', soft: '52, 118, 235' },
        { type: 'white', rgb: '255, 255, 255', soft: '245, 248, 255' },
        { type: 'black', rgb: '24, 28, 36', soft: '55, 60, 72' },
        { type: 'gold', rgb: '212, 168, 67', soft: '242, 206, 112' }
    ];

    function createRng(seed) {
        let s = seed % 2147483647;
        if (s <= 0) s += 2147483646;
        return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    // Pre-render satu splash ke offscreen canvas agar animasi fade-in/out ringan
    function bakeSplashSprite(baseRadius, colorObj, seed, isGoldAccent = false) {
        const rng = createRng(seed);
        const pad = Math.ceil(baseRadius * 2.15);
        const size = pad * 2;

        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d', { alpha: true });
        if (!octx) return null;

        const cx = pad;
        const cy = pad;
        const lobes = 9 + Math.floor(rng() * 6);
        const points = [];
        const angleStep = (Math.PI * 2) / lobes;

        for (let i = 0; i < lobes; i++) {
            const angle = i * angleStep + (rng() - 0.5) * 0.25;
            const radialJitter = 0.58 + rng() * 0.72;
            const r = baseRadius * radialJitter;
            points.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            });
        }

        const layers = isGoldAccent ? 2 : 3;
        for (let layer = 0; layer < layers; layer++) {
            const scale = 1 - layer * 0.16;
            const alpha = isGoldAccent
                ? (0.34 - layer * 0.09)
                : (colorObj.type === 'white' ? 0.26 - layer * 0.06 : 0.20 - layer * 0.04);

            const grad = octx.createRadialGradient(
                cx + (rng() - 0.5) * baseRadius * 0.2,
                cy + (rng() - 0.5) * baseRadius * 0.2,
                baseRadius * 0.08,
                cx,
                cy,
                baseRadius * scale * 1.15
            );
            grad.addColorStop(0, `rgba(${colorObj.soft}, ${Math.max(0.04, alpha)})`);
            grad.addColorStop(0.65, `rgba(${colorObj.rgb}, ${Math.max(0.02, alpha * 0.85)})`);
            grad.addColorStop(1, `rgba(${colorObj.rgb}, 0)`);

            octx.fillStyle = grad;
            octx.beginPath();

            const firstMidX = (points[points.length - 1].x + points[0].x) / 2;
            const firstMidY = (points[points.length - 1].y + points[0].y) / 2;
            octx.moveTo(firstMidX, firstMidY);

            for (let i = 0; i < points.length; i++) {
                const curr = points[i];
                const next = points[(i + 1) % points.length];
                const px = cx + (curr.x - cx) * scale;
                const py = cy + (curr.y - cy) * scale;
                const nx = cx + (next.x - cx) * scale;
                const ny = cy + (next.y - cy) * scale;
                const midX = (px + nx) / 2;
                const midY = (py + ny) / 2;
                octx.quadraticCurveTo(px, py, midX, midY);
            }

            octx.closePath();
            octx.fill();
        }

        const droplets = isGoldAccent ? 14 : 10 + Math.floor(rng() * 10);
        for (let d = 0; d < droplets; d++) {
            const dist = baseRadius * (0.75 + rng() * 0.95);
            const theta = rng() * Math.PI * 2;
            const dx = cx + Math.cos(theta) * dist;
            const dy = cy + Math.sin(theta) * dist;
            const dr = isGoldAccent ? (1.2 + rng() * 3.2) : (1.5 + rng() * 5.5);
            const dAlpha = isGoldAccent ? (0.38 + rng() * 0.35) : (0.16 + rng() * 0.22);

            octx.fillStyle = `rgba(${colorObj.rgb}, ${dAlpha})`;
            octx.beginPath();
            octx.ellipse(
                dx,
                dy,
                dr * (0.8 + rng() * 0.6),
                dr * (0.7 + rng() * 0.5),
                rng() * Math.PI,
                0,
                Math.PI * 2
            );
            octx.fill();
        }

        return { canvas: off, halfSize: pad };
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let splashes = [];
    let rafId = null;
    let lastDrawTime = 0;
    const frameInterval = 1000 / 26; // ~26 fps agar ringan & mulus
    const startTime = performance.now();

    function buildSplashes() {
        width = mainEl.clientWidth;
        height = mainEl.scrollHeight;
        if (!width || !height) return;

        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const rng = createRng(20261124);
        const stepY = Math.max(340, Math.min(480, height / 7));
        const count = Math.ceil(height / stepY) + 1;
        const list = [];

        for (let i = 0; i < count; i++) {
            const yCenter = i * stepY + stepY * (0.25 + rng() * 0.5);
            const xCenter = width * (0.14 + rng() * 0.72);
            const baseR = Math.min(width, 500) * (0.20 + rng() * 0.16);

            let picked = palette[Math.floor(rng() * palette.length)];
            if (i % 3 === 0) picked = palette[0]; // Royal Blue
            if (i % 4 === 1) picked = palette[2]; // Putih

            const mainSprite = bakeSplashSprite(
                baseR,
                picked,
                1000 + i * 37,
                picked.type === 'gold'
            );

            if (mainSprite) {
                list.push({
                    sprite: mainSprite,
                    x: xCenter,
                    y: yCenter,
                    period: 6500 + rng() * 5500, // durasi 1 siklus muncul-memudar (ms)
                    phase: rng() * Math.PI * 2,
                    driftX: (rng() - 0.5) * 14,
                    driftY: (rng() - 0.5) * 14,
                    baseScale: 0.94 + rng() * 0.1
                });
            }

            // Aksen emas / percikan tambahan di dekat splash utama
            if (rng() > 0.35) {
                const goldObj = palette[4];
                const offsetAngle = rng() * Math.PI * 2;
                const offsetDist = baseR * (0.45 + rng() * 0.55);
                const goldR = baseR * (0.34 + rng() * 0.24);
                const goldSprite = bakeSplashSprite(goldR, goldObj, 5000 + i * 73, true);

                if (goldSprite) {
                    list.push({
                        sprite: goldSprite,
                        x: xCenter + Math.cos(offsetAngle) * offsetDist,
                        y: yCenter + Math.sin(offsetAngle) * offsetDist,
                        period: 5500 + rng() * 5000,
                        phase: rng() * Math.PI * 2,
                        driftX: (rng() - 0.5) * 10,
                        driftY: (rng() - 0.5) * 10,
                        baseScale: 0.92 + rng() * 0.12
                    });
                }
            }
        }

        splashes = list;
    }

    // Kurva smooth fade-in -> hold -> fade-out
    function getCycleAlpha(tSec, periodMs, phase) {
        const periodSec = periodMs / 1000;
        const progress = (((tSec + (phase / (Math.PI * 2)) * periodSec) % periodSec) + periodSec) % periodSec / periodSec;

        // 0.00 - 0.35: muncul perlahan, 0.35 - 0.65: tampak, 0.65 - 1.00: memudar perlahan
        if (progress < 0.35) {
            const k = progress / 0.35;
            return k * k * (3 - 2 * k);
        }
        if (progress <= 0.65) {
            return 1;
        }
        const k = (progress - 0.65) / 0.35;
        const fade = 1 - k * k * (3 - 2 * k);
        return Math.max(0, fade);
    }

    function drawFrame(now) {
        if (document.hidden) {
            rafId = requestAnimationFrame(drawFrame);
            return;
        }

        if (now - lastDrawTime >= frameInterval) {
            lastDrawTime = now;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);

            const elapsedSec = (now - startTime) / 1000;

            for (let i = 0; i < splashes.length; i++) {
                const item = splashes[i];
                const alpha = getCycleAlpha(elapsedSec, item.period, item.phase);
                if (alpha <= 0.01) continue;

                const wave = Math.sin(elapsedSec * (1000 / item.period) * Math.PI * 2 + item.phase);
                const drawX = item.x + item.driftX * wave;
                const drawY = item.y + item.driftY * wave;
                const scale = item.baseScale + wave * 0.03;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(drawX, drawY);
                ctx.scale(scale, scale);
                ctx.drawImage(
                    item.sprite.canvas,
                    -item.sprite.halfSize,
                    -item.sprite.halfSize
                );
                ctx.restore();
            }
        }

        rafId = requestAnimationFrame(drawFrame);
    }

    buildSplashes();
    rafId = requestAnimationFrame(drawFrame);

    window.addEventListener('load', () => {
        setTimeout(buildSplashes, 250);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildSplashes, 200);
    });
}
