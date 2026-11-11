/* src/lib/scripts/music.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Live track from Discord presence and its LRCLIB lyrics

import { pickListening, type Presence } from '#lib/scripts/discord.ts';

import { lrcLibHosts, websiteDomain, websiteUrl } from '#lib';

export interface Track {
	song: string;
	artist: string;
	album: string;
	art: string;
	url: string;
	start: number | null;
	end: number | null;
	duration: number;
	live: boolean;
	// Which app the track is playing in
	source: 'doughmination' | 'spotify';
}

export interface LyricWord {
	t: number;
	end: number;
	text: string;
}

export interface LyricLine {
	t: number;
	text: string;
	// Word-by-word timing, when the lyrics have it
	words?: LyricWord[];
}

export type Lyrics =
	| { kind: 'note'; text: string }
	| { kind: 'loading' }
	| { kind: 'instrumental' }
	| { kind: 'synced'; lines: LyricLine[] }
	| { kind: 'plain'; lines: string[] };

// ---- Tracks ---------------------------------------------------------------

export function trackFromPresence(p: Presence | null): Track | null {
	const listening = pickListening(p);
	if (!listening) return null;
	const { song, artist, album, album_art_url, timestamps, track_id } = listening.track;
	const start = timestamps?.start ?? null;
	const end = timestamps?.end ?? null;
	return {
		song,
		artist,
		album,
		art: album_art_url ?? '',
		url: track_id ? `https://open.spotify.com/track/${track_id}` : '',
		start,
		end,
		duration: start && end ? end - start : 0,
		live: true,
		source: listening.source
	};
}

export function trackKey(t: Track | null): string {
	return t ? [t.song, t.artist, t.album].map((x) => x.toLowerCase()).join('␟') : '';
}

// ---- Lyrics ---------------------------------------------------------------

interface LrclibRecord {
	instrumental?: boolean;
	syncedLyrics?: string | null;
	plainLyrics?: string | null;
	// YAML Lyricsfile, the only place LRCLIB keeps word timings
	lyricsfile?: string | null;
}

interface Lyricsfile {
	lines?: {
		text?: string;
		start_ms?: number;
		end_ms?: number;
		words?: { text?: string; start_ms?: number; end_ms?: number }[];
	}[];
}

// Mirrors don't all send hasWordSync, so look for the timings themselves
const LYRICSFILE_WORDS = /^\s+words:/m;
const LRC_WORD_TAG = /<(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)>/;

function hasWords(r: LrclibRecord): boolean {
	return LYRICSFILE_WORDS.test(r.lyricsfile ?? '') || LRC_WORD_TAG.test(r.syncedLyrics ?? '');
}

const lyricsCache = new Map<string, Lyrics>();

async function fromAnyHost(
	request: (host: string) => Promise<LrclibRecord | null>
): Promise<LrclibRecord | null> {
	for (const host of lrcLibHosts) {
		try {
			const record = await request(host);
			if (record) return record;
		} catch {
			// Try the next mirror
		}
	}
	return null;
}

function lrclibGet(params: Record<string, string>) {
	const qs = new URLSearchParams(params);
	return fromAnyHost(async (host) => {
		const res = await fetch(`${host}/api/get?${qs}`, {
			headers: { 'X-User-Agent': `${websiteDomain} music (${websiteUrl})` }
		});
		return res.ok ? ((await res.json()) as LrclibRecord) : null;
	});
}

function lrclibSearch(track_name: string, artist_name: string) {
	const qs = new URLSearchParams({ track_name, artist_name });
	return fromAnyHost(async (host) => {
		const res = await fetch(`${host}/api/search?${qs}`);
		if (!res.ok) return null;
		const list = (await res.json()) as LrclibRecord[];
		if (!Array.isArray(list) || !list.length) return null;
		return (
			list.find(hasWords) ??
			list.find((r) => r.syncedLyrics) ??
			list.find((r) => r.plainLyrics) ??
			list[0]
		);
	});
}

function lrcTime(mins: string, secs: string): number {
	return (Number(mins) * 60 + parseFloat(secs.replace(':', '.'))) * 1000;
}

// Enhanced LRC: <mm:ss.xx> before each word, sometimes a closing one after the last
function parseLrcWords(text: string): { text: string; words?: LyricWord[] } {
	const parts = text.split(new RegExp(LRC_WORD_TAG.source, 'g'));
	if (parts.length < 4) return { text };
	const words: LyricWord[] = [];
	for (let i = 1; i < parts.length; i += 3) {
		const t = lrcTime(parts[i], parts[i + 1]);
		const prev = words.at(-1);
		if (prev) prev.end = t;
		if (parts[i + 2]) words.push({ t, end: NaN, text: parts[i + 2] });
	}
	if (!words.length)
		return {
			text: parts
				.filter((_, i) => i % 3 === 0)
				.join('')
				.trim()
		};
	// Anything before the first tag rides along with the first word
	words[0].text = parts[0] + words[0].text;
	words.at(-1)!.text = words.at(-1)!.text.trimEnd();
	return { text: words.map((w) => w.text).join(''), words };
}

function parseLrc(text: string): LyricLine[] {
	const tag = /\[(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;
	const lines: LyricLine[] = [];
	for (const line of text.split(/\r?\n/)) {
		const stamps = [...line.matchAll(tag)];
		if (!stamps.length) continue;
		const last = stamps.at(-1)!;
		// Drop duet voice markers like 'v1:' that some uploads put before the word tags
		const rest = line
			.slice(last.index + last[0].length)
			.trim()
			.replace(/^v\d+:\s*(?=<)/, '');
		const parsed = parseLrcWords(rest);
		for (const [, mins, secs] of stamps) {
			lines.push({ t: lrcTime(mins, secs), ...parsed });
		}
	}
	return lines.sort((a, b) => a.t - b.t);
}

async function parseLyricsfile(text: string): Promise<LyricLine[]> {
	const { parse } = await import('yaml');
	const doc = parse(text) as Lyricsfile | null;
	const lines: LyricLine[] = [];
	for (const line of doc?.lines ?? []) {
		if (typeof line.start_ms !== 'number') continue;
		const words = (line.words ?? [])
			.filter((w) => typeof w.start_ms === 'number' && w.text)
			.map((w) => ({ t: w.start_ms!, end: w.end_ms ?? NaN, text: String(w.text) }));
		for (const [i, w] of words.entries()) {
			if (Number.isNaN(w.end)) w.end = words[i + 1]?.t ?? line.end_ms ?? NaN;
		}
		lines.push({
			t: line.start_ms,
			text: words.length ? words.map((w) => w.text).join('') : String(line.text ?? ''),
			words: words.length ? words : undefined
		});
	}
	return lines.sort((a, b) => a.t - b.t);
}

// A last word with no end of its own runs until the next line, capped so it doesn't crawl through a gap
function closeWords(lines: LyricLine[]): LyricLine[] {
	for (const [i, line] of lines.entries()) {
		const last = line.words?.at(-1);
		if (last && Number.isNaN(last.end)) {
			last.end = Math.min(lines[i + 1]?.t ?? Infinity, last.t + 1500);
		}
	}
	return lines;
}

// How much of a word has been sung, 0 to 1
export function wordProgress(word: LyricWord, at: number): number {
	if (at >= word.end) return 1;
	if (at <= word.t) return 0;
	return (at - word.t) / (word.end - word.t);
}

async function toLyrics(record: LrclibRecord | null): Promise<Lyrics> {
	if (record?.instrumental) return { kind: 'instrumental' };
	let synced: LyricLine[] = [];
	if (record?.lyricsfile && LYRICSFILE_WORDS.test(record.lyricsfile)) {
		try {
			synced = await parseLyricsfile(record.lyricsfile);
		} catch {
			// Fall back to the line-synced LRC
		}
	}
	if (!synced.length) synced = parseLrc(record?.syncedLyrics ?? '');
	if (synced.length) return { kind: 'synced', lines: closeWords(synced) };
	if (record?.plainLyrics) return { kind: 'plain', lines: record.plainLyrics.split(/\r?\n/) };
	return { kind: 'note', text: 'No lyrics found for this one.' };
}

// Exact match when the duration is known, falling back to a fuzzy search
export async function fetchLyrics(track: Track): Promise<Lyrics> {
	const key = trackKey(track);
	const cached = lyricsCache.get(key);
	if (cached) return cached;
	let record: LrclibRecord | null = null;
	if (track.live && track.duration) {
		record = await lrclibGet({
			track_name: track.song,
			artist_name: track.artist,
			album_name: track.album,
			duration: String(Math.round(track.duration / 1000))
		});
	}
	record ??= await lrclibSearch(track.song, track.artist);
	const lyrics = await toLyrics(record);
	lyricsCache.set(key, lyrics);
	return lyrics;
}

// ---- Album art tint -------------------------------------------------------

const TINT_SIZE = 24;
const HUE_BUCKETS = 12;
const tintCache = new Map<string, string | null>();

function loadForCanvas(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		// Without CORS the canvas can't be read back, so the load fails instead
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
}

// The cover's most vivid hue, at a fixed lightness so it reads on the dark page.
// Null when the cover is close to greyscale or its host won't allow reading it
export async function artTint(url: string): Promise<string | null> {
	const hit = tintCache.get(url);
	if (hit !== undefined) return hit;
	let tint: string | null = null;
	try {
		tint = vividHue(await loadForCanvas(url));
	} catch {
		// Keep the site's own accent
	}
	tintCache.set(url, tint);
	return tint;
}

function vividHue(img: HTMLImageElement): string | null {
	const canvas = document.createElement('canvas');
	canvas.width = TINT_SIZE;
	canvas.height = TINT_SIZE;
	const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
	ctx.drawImage(img, 0, 0, TINT_SIZE, TINT_SIZE);
	const pixels = ctx.getImageData(0, 0, TINT_SIZE, TINT_SIZE).data;

	// Colourfulness per slice of the hue wheel, with the hue kept as a vector
	// so reds either side of 0° average properly
	const weight = new Array<number>(HUE_BUCKETS).fill(0);
	const sumX = new Array<number>(HUE_BUCKETS).fill(0);
	const sumY = new Array<number>(HUE_BUCKETS).fill(0);

	for (let i = 0; i < pixels.length; i += 4) {
		const red = pixels[i] / 255;
		const green = pixels[i + 1] / 255;
		const blue = pixels[i + 2] / 255;
		const max = Math.max(red, green, blue);
		const chroma = max - Math.min(red, green, blue);
		if (chroma < 0.08) continue;

		let hue: number;
		if (max === red) hue = ((green - blue) / chroma + 6) % 6;
		else if (max === green) hue = (blue - red) / chroma + 2;
		else hue = (red - green) / chroma + 4;

		const bucket = Math.floor((hue / 6) * HUE_BUCKETS) % HUE_BUCKETS;
		const angle = (hue / 6) * 2 * Math.PI;
		weight[bucket] += chroma;
		sumX[bucket] += Math.cos(angle) * chroma;
		sumY[bucket] += Math.sin(angle) * chroma;
	}

	const best = weight.indexOf(Math.max(...weight));
	// Too little colour to call it a tint
	if (weight[best] / (TINT_SIZE * TINT_SIZE) < 0.02) return null;

	const degrees = (Math.atan2(sumY[best], sumX[best]) * 180) / Math.PI;
	return `hsl(${Math.round((degrees + 360) % 360)} 75% 68%)`;
}

// ---- Formatting -----------------------------------------------------------

export function timeAgo(uts: number, now: number): string {
	const s = Math.floor(now / 1000) - uts;
	if (s < 60) return 'just now';
	if (s < 3600) return `${Math.floor(s / 60)} min ago`;
	if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
	const days = Math.floor(s / 86400);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}
