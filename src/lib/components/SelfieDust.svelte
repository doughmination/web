<!-- src/lib/components/SelfieDust.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import { untrack } from 'svelte';

	// Two stacked photos. Swapping between them breaks the shown one into dust
	// and blows it into the other. The real <img>s sit on top of the canvas and
	// only fade out right at the ends, so at rest the page shows crisp images,
	// not a mosaic

	type Photo = { src: string; alt: string; width: number; height: number; focusY?: number };

	let { from, to, revealed }: { from: Photo; to: Photo; revealed: boolean } = $props();

	const COLS = 48;
	const ROWS = 60;
	const DURATION = 1400;
	// How much of the run is spent staggering particle start times
	const SPREAD = 0.45;
	// How far past the frame the dust can fly, in CSS px
	const BLEED = 12;
	// Share of t at each end used to crossfade the real image with the mosaic
	const EDGE = 0.08;

	type Particle = {
		ax: number;
		ay: number;
		bx: number;
		by: number;
		cx: number;
		cy: number;
		ca: number[];
		cb: number[];
		delay: number;
	};

	let canvas: HTMLCanvasElement | undefined = $state();
	let box: HTMLDivElement | undefined = $state();

	// 0 is showing `from`, 1 is showing `to`
	let t = $state(0);
	let particles: Particle[] | null = null;
	let animated = $state(false);
	let frame = 0;
	let last = 0;

	const fromOpacity = $derived(Math.max(0, 1 - t / EDGE));
	const toOpacity = $derived(Math.max(0, (t - (1 - EDGE)) / EDGE));

	function load(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	// Same maths as object-fit: cover, so the mosaic lines up with the <img>
	function sample(img: HTMLImageElement, focusY: number): Uint8ClampedArray {
		const c = document.createElement('canvas');
		c.width = COLS;
		c.height = ROWS;
		const ctx = c.getContext('2d', { willReadFrequently: true })!;
		const scale = Math.max(COLS / img.naturalWidth, ROWS / img.naturalHeight);
		const w = img.naturalWidth * scale;
		const h = img.naturalHeight * scale;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(img, (COLS - w) / 2, (ROWS - h) * focusY, w, h);
		return ctx.getImageData(0, 0, COLS, ROWS).data;
	}

	function build(a: Uint8ClampedArray, b: Uint8ClampedArray): Particle[] {
		const n = COLS * ROWS;
		// Each speck of the first photo lands somewhere random in the second
		const targets = Array.from({ length: n }, (_, i) => i);
		for (let i = n - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[targets[i], targets[j]] = [targets[j], targets[i]];
		}

		return targets.map((target, i) => {
			const ax = (i % COLS) / COLS;
			const ay = Math.floor(i / COLS) / ROWS;
			const bx = (target % COLS) / COLS;
			const by = Math.floor(target / COLS) / ROWS;
			return {
				ax,
				ay,
				bx,
				by,
				// Pulled up and to the right like it's caught by a breeze
				cx: (ax + bx) / 2 + 0.35 + (Math.random() - 0.5) * 0.9,
				cy: (ay + by) / 2 - 0.3 + (Math.random() - 0.5) * 0.9,
				ca: Array.from(a.subarray(i * 4, i * 4 + 4)),
				cb: Array.from(b.subarray(target * 4, target * 4 + 4)),
				// Sweeps left to right, ragged
				delay: (ax * 0.75 + Math.random() * 0.25) * SPREAD
			};
		});
	}

	const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);

	function draw() {
		if (!canvas || !box || !particles) return;
		const dpr = devicePixelRatio || 1;
		const { width, height } = box.getBoundingClientRect();
		const cw = width + BLEED * 2;
		const ch = height + BLEED * 2;
		if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
			canvas.width = Math.round(cw * dpr);
			canvas.height = Math.round(ch * dpr);
		}
		const ctx = canvas.getContext('2d')!;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, cw, ch);
		if (t <= 0 || t >= 1) return;

		const cell = width / COLS;
		for (const p of particles) {
			const raw = Math.min(1, Math.max(0, t * (1 + SPREAD) - p.delay));
			const k = ease(raw);
			const u = 1 - k;
			// Quadratic bezier through the scattered control point
			const x = u * u * p.ax + 2 * u * k * p.cx + k * k * p.bx;
			const y = u * u * p.ay + 2 * u * k * p.cy + k * k * p.by;
			const alpha = (p.ca[3] + (p.cb[3] - p.ca[3]) * k) / 255;
			if (alpha < 0.02) continue;
			const r = Math.round(p.ca[0] + (p.cb[0] - p.ca[0]) * k);
			const g = Math.round(p.ca[1] + (p.cb[1] - p.ca[1]) * k);
			const bl = Math.round(p.ca[2] + (p.cb[2] - p.ca[2]) * k);
			// Specks shrink mid-flight so it reads as dust, not tiles
			const size = cell * (1 - 0.65 * Math.sin(Math.PI * k)) + 0.5;
			ctx.fillStyle = `rgb(${r} ${g} ${bl} / ${alpha})`;
			ctx.fillRect(BLEED + x * width, BLEED + y * height, size, size);
		}
	}

	function step(time: number) {
		const dt = last ? time - last : 16;
		last = time;
		const target = revealed ? 1 : 0;
		const move = dt / DURATION;
		t = target > t ? Math.min(target, t + move) : Math.max(target, t - move);
		draw();
		if (t !== target) {
			frame = requestAnimationFrame(step);
		} else {
			frame = 0;
		}
	}

	$effect(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let cancelled = false;
		Promise.all([load(from.src), load(to.src)])
			.then(([a, b]) => {
				if (cancelled) return;
				particles = build(sample(a, from.focusY ?? 0.5), sample(b, to.focusY ?? 0.5));
				animated = true;
			})
			.catch(() => {
				// Falls back to the plain crossfade
			});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const target = revealed ? 1 : 0;
		if (!animated) {
			t = target;
			return;
		}
		// step() reads `revealed` itself, so a swap mid-flight just turns round
		if (!frame && untrack(() => t) !== target) {
			last = 0;
			frame = requestAnimationFrame(step);
		}
	});

	$effect(() => () => cancelAnimationFrame(frame));
</script>

<div class="selfie-stack" class:selfie-fade={!animated} bind:this={box}>
	<canvas
		class="selfie-dust"
		bind:this={canvas}
		style:inset="-{BLEED}px"
		style:width="calc(100% + {BLEED * 2}px)"
		style:height="calc(100% + {BLEED * 2}px)"
		aria-hidden="true"
	></canvas>
	<img
		class="selfie selfie-pixel"
		style:object-position="center {(from.focusY ?? 0.5) * 100}%"
		src={from.src}
		alt={from.alt}
		width={from.width}
		height={from.height}
		style:opacity={fromOpacity}
	/>
	<img
		class="selfie"
		style:object-position="center {(to.focusY ?? 0.5) * 100}%"
		src={to.src}
		alt=""
		width={to.width}
		height={to.height}
		style:opacity={toOpacity}
	/>
</div>
