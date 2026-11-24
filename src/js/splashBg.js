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

    function drawOrganicBlob(cx, cy, baseRadius, colorObj, rng, isGoldAccent = false) {
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
                ? (0.28 - layer * 0.08)
                : (colorObj.type === 'white' ? 0.22 - layer * 0.05 : 0.17 - layer * 0.04);

            const grad = ctx.createRadialGradient(
                cx + (rng() - 0.5) * baseRadius * 0.2,
                cy + (rng() - 0.5) * baseRadius * 0.2,
                baseRadius * 0.08,
                cx,
                cy,
                baseRadius * scale * 1.15
            );
            grad.addColorStop(0, `rgba(${colorObj.soft}, ${Math.max(0.03, alpha)})`);
            grad.addColorStop(0.65, `rgba(${colorObj.rgb}, ${Math.max(0.02, alpha * 0.85)})`);
            grad.addColorStop(1, `rgba(${colorObj.rgb}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();

            const firstMidX = (points[points.length - 1].x + points[0].x) / 2;
            const firstMidY = (points[points.length - 1].y + points[0].y) / 2;
            ctx.moveTo(firstMidX, firstMidY);

            for (let i = 0; i < points.length; i++) {
                const curr = points[i];
                const next = points[(i + 1) % points.length];
                const px = cx + (curr.x - cx) * scale;
                const py = cy + (curr.y - cy) * scale;
                const nx = cx + (next.x - cx) * scale;
                const ny = cy + (next.y - cy) * scale;
                const midX = (px + nx) / 2;
                const midY = (py + ny) / 2;
                ctx.quadraticCurveTo(px, py, midX, midY);
            }

            ctx.closePath();
            ctx.fill();
        }

        const droplets = isGoldAccent ? 14 : 10 + Math.floor(rng() * 10);
        for (let d = 0; d < droplets; d++) {
            const dist = baseRadius * (0.75 + rng() * 0.95);
            const theta = rng() * Math.PI * 2;
            const dx = cx + Math.cos(theta) * dist;
            const dy = cy + Math.sin(theta) * dist;
            const dr = isGoldAccent ? (1.2 + rng() * 3.2) : (1.5 + rng() * 5.5);
            const dAlpha = isGoldAccent ? (0.35 + rng() * 0.35) : (0.14 + rng() * 0.22);

            ctx.fillStyle = `rgba(${colorObj.rgb}, ${dAlpha})`;
            ctx.beginPath();
            ctx.ellipse(
                dx,
                dy,
                dr * (0.8 + rng() * 0.6),
                dr * (0.7 + rng() * 0.5),
                rng() * Math.PI,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    function renderSplash() {
        const width = mainEl.clientWidth;
        const height = mainEl.scrollHeight;
        if (!width || !height) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const rng = createRng(20261124);
        const stepY = Math.max(320, Math.min(460, height / 7));
        const count = Math.ceil(height / stepY) + 1;

        for (let i = 0; i < count; i++) {
            const yCenter = i * stepY + stepY * (0.25 + rng() * 0.5);
            const xCenter = width * (0.12 + rng() * 0.76);
            const baseR = Math.min(width, 520) * (0.22 + rng() * 0.18);

            let picked = palette[Math.floor(rng() * palette.length)];
            if (i % 3 === 0) picked = palette[0]; // Royal Blue
            if (i % 4 === 1) picked = palette[2]; // Putih

            drawOrganicBlob(xCenter, yCenter, baseR, picked, rng, picked.type === 'gold');

            if (rng() > 0.35) {
                const goldObj = palette[4];
                const offsetAngle = rng() * Math.PI * 2;
                const offsetDist = baseR * (0.45 + rng() * 0.55);
                drawOrganicBlob(
                    xCenter + Math.cos(offsetAngle) * offsetDist,
                    yCenter + Math.sin(offsetAngle) * offsetDist,
                    baseR * (0.35 + rng() * 0.25),
                    goldObj,
                    rng,
                    true
                );
            }
        }
    }

    renderSplash();

    window.addEventListener('load', () => {
        setTimeout(renderSplash, 250);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderSplash, 200);
    });
}
