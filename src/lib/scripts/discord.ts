/* src/lib/scripts/discord.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Discord presence page: data shapes, API calls and formatting helpers for
// the Doughmination API (https://doughmination.uk, see /docs there)

import { cached, invalidateOn } from '#lib/scripts/cache.ts';

export const API_BASE = 'https://doughmination.uk';
export const WS_URL = 'wss://doughmination.uk/v2/ws';

export type Status = 'online' | 'idle' | 'dnd' | 'offline';

export interface Spotify {
	song: string;
	artist: string;
	album: string;
	album_art_url: string | null;
	track_id?: string | null;
	timestamps: { start: number | null; end: number | null } | null;
}

export interface Activity {
	type: number;
	name?: string;
	details?: string;
	state?: string;
	url?: string;
	application_id?: string;
	timestamps?: { start?: number; end?: number };
	party?: { size?: number[] };
	buttons?: (string | { label?: string })[];
	emoji?: { id?: string; name?: string; animated?: boolean };
	assets?: {
		large_image?: string;
		large_image_url?: string;
		large_text?: string;
		small_image?: string;
		small_text?: string;
	};
}

export interface Presence {
	user_id: string;
	status: Status;
	online: boolean;
	platform: { desktop: boolean; mobile: boolean; web: boolean };
	streaming: boolean;
	activities: Activity[];
	custom_status: {
		text: string | null;
		emoji: { id: string | null; name: string | null; animated: boolean; url: string | null } | null;
	} | null;
	listening_to_spotify: boolean;
	spotify: Spotify | null;
}

export interface Collectible {
	slot: string;
	type: string;
	name: string | null;
	static_image_url: string | null;
	animated_image_url: string | null;
	video_url: string | null;
}

export interface WishlistItem extends Omit<Collectible, 'slot'> {
	sku_id: string;
	is_owned: boolean | null;
	price: { amount: number; currency: string; exponent: number } | null;
}

export interface DiscordRecord {
	user: {
		id: string;
		username: string;
		global_name: string | null;
		display_name: string | null;
		avatar_url: string;
		banner_url: string | null;
		clan: { guild_id: string; tag: string; badge_url: string | null } | null;
		bio: string | null;
		pronouns: string | null;
		display_name_styles: {
			colors: number[] | null;
			font_id: number | null;
			effect_id: number | null;
		} | null;
		premium: { type: string; since: string | null; guild_since: string | null } | null;
	};
	presence: Presence | null;
	badges: { id: string; description: string; icon_url: string | null; link: string | null }[];
	clientBadges: { id: string; tooltip: string; icon_url: string }[] | null;
	connected_accounts: { type: string; id: string; name: string; verified: boolean }[];
	wishlist: WishlistItem[] | null;
	collectibles: Collectible[] | null;
	pronoundb: string | null;
	timezone: { timezone: string; utc_offset_minutes: number | null } | null;
}

// ---- API ------------------------------------------------------------------

// Live presence comes over the socket, so the rest of the record can be kept a while
export function fetchUser(id: string): Promise<DiscordRecord> {
	return cached(
		`discord:${id}`,
		async () => {
			const res = await fetch(`${API_BASE}/v2/discord/users/${id}`);
			const body = (await res.json()) as {
				success: boolean;
				data?: DiscordRecord;
				error?: { message?: string };
			};
			if (!body.success) throw new Error(body.error?.message ?? `Request failed (${res.status})`);
			return body.data as DiscordRecord;
		},
		{ ttl: 10 * 60_000, events: ['reconnect'] }
	);
}

// ---- Live socket ----------------------------------------------------------

// One socket for the whole visit: it opens once (see hooks.client.ts) and stays
// open across page changes, remembering the latest presence of everyone it's
// subscribed to, so a page shows it straight away instead of reconnecting.
// The subscribed ids only ever grow. A reconnect is reported as 'reconnect'
// so callers can catch up on anything they missed.

interface Listener {
	ids: string[];
	onPresence: (p: Presence) => void;
	onEvent?: (type: string) => void;
}

const listeners = new Set<Listener>();
const subscribed = new Set<string>();
const presences = new Map<string, Presence>();
let ws: WebSocket | null = null;
let retry = 0;
let ping: ReturnType<typeof setInterval> | undefined;

function sendSubscribe() {
	if (ws?.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({ type: 'subscribe', ids: [...subscribed] }));
	}
}

function emitPresence(p: Presence) {
	presences.set(p.user_id, p);
	for (const l of listeners) if (l.ids.includes(p.user_id)) l.onPresence(p);
}

// Drop stale cached responses before telling pages, so their refetch gets fresh data
function emitEvent(type: string) {
	invalidateOn(type);
	for (const l of listeners) l.onEvent?.(type);
}

function connect() {
	ws = new WebSocket(WS_URL);

	ws.onopen = () => {
		if (retry) emitEvent('reconnect');
		retry = 0;
		sendSubscribe();
		ping = setInterval(() => ws?.send('ping'), 30_000);
	};

	ws.onmessage = (event) => {
		if (event.data === 'pong') return;
		let msg;
		try {
			msg = JSON.parse(event.data);
		} catch {
			return;
		}
		if (msg.type === 'init_state') {
			for (const id of subscribed) if (msg.data?.[id]) emitPresence(msg.data[id]);
		} else if (msg.type === 'presence_update') {
			if (subscribed.has(msg.data?.user_id)) emitPresence(msg.data);
		} else if (typeof msg.type === 'string') {
			emitEvent(msg.type);
		}
	};

	ws.onclose = () => {
		clearInterval(ping);
		setTimeout(connect, Math.min(30_000, 1000 * 2 ** retry++));
	};
}

// Opens the socket if it isn't already, and adds any new ids to it
export function connectLive(ids: string[]) {
	if (typeof WebSocket === 'undefined') return;
	const before = subscribed.size;
	for (const id of ids) subscribed.add(id);
	if (!ws) connect();
	else if (subscribed.size !== before) sendSubscribe();
}

// Calls onPresence with the latest known presence of each id right away, then
// with every update. Any other event the socket pushes (fronters_update,
// device_update, ...) goes to onEvent by type. Returns a function that stops
// listening; the socket itself stays open.
export function subscribePresence(
	ids: string[],
	onPresence: (p: Presence) => void,
	onEvent?: (type: string) => void
): () => void {
	const listener = { ids, onPresence, onEvent };
	listeners.add(listener);
	for (const id of ids) {
		const p = presences.get(id);
		if (p) onPresence(p);
	}
	connectLive(ids);
	return () => listeners.delete(listener);
}

// ---- Presence helpers -----------------------------------------------------

const MUSIC_APP = 'Doughmination Music';

// Doughmination Music takes priority over Spotify
export function pickListening(
	p: Presence | null
): { track: Spotify; source: 'doughmination' | 'spotify' } | null {
	if (!p) return null;
	const a = p.activities.find((x) => x.type === 2 && x.name === MUSIC_APP);
	if (a) {
		const song = a.details ?? '';
		const state = a.state ?? '';
		let artist = state;
		if (song && state.endsWith(song)) {
			artist = state
				.slice(0, -song.length)
				.replace(/\s*[—–-]\s*$/, '')
				.trim();
		} else {
			const parts = state.split(/\s+[—–-]\s+/);
			if (parts.length > 1) artist = parts[0].trim();
		}
		const large = a.assets?.large_text ?? '';
		return {
			source: 'doughmination',
			track: {
				song,
				artist,
				album: large && large !== song ? large : '',
				album_art_url:
					a.assets?.large_image_url ?? assetUrl(a.application_id, a.assets?.large_image),
				timestamps: a.timestamps
					? { start: a.timestamps.start ?? null, end: a.timestamps.end ?? null }
					: null
			}
		};
	}
	return p.listening_to_spotify && p.spotify ? { track: p.spotify, source: 'spotify' } : null;
}

// display_name_styles.font_id -> @font-face family from presence.css
// (IDs from https://docs.discord.food/resources/user; 1, 2, 5 and 9 are deprecated)
export const NAME_FONTS: Record<number, string> = {
	3: "'DDN Sakura', cursive",
	4: "'DDN Jellybean', cursive",
	6: "'DDN Modern', sans-serif",
	7: "'DDN Medieval', serif",
	8: "'DDN 8Bit', monospace",
	10: "'DDN Vampyre', serif",
	11: "'DDN gg sans', sans-serif",
	12: "'DDN Tempo', serif",
	13: "'DDN Monkey Bars', sans-serif",
	14: "'DDN Mainframe', sans-serif",
	15: "'DDN Headbang', serif",
	16: "'DDN Journal', cursive"
};

export function findCollectible(
	record: DiscordRecord | null | undefined,
	slot: string
): Collectible | undefined {
	return record?.collectibles?.find((c) => c.slot === slot || c.type === slot);
}

export function realConnections(
	record: DiscordRecord | null | undefined
): DiscordRecord['connected_accounts'] {
	return (record?.connected_accounts ?? []).filter(
		(a) => a.name && !['null', 'undefined'].includes(a.name.trim().toLowerCase())
	);
}

export function nameGradient(colours: number[] | null | undefined): string | undefined {
	if (!colours?.length) return undefined;
	const hex = colours.map(intToHex);
	return `linear-gradient(90deg, ${hex.length === 1 ? `${hex[0]}, ${hex[0]}` : hex.join(', ')})`;
}

// Click / keyboard handler for a container holding rendered markdown
export function revealSpoiler(event: Event) {
	const spoiler = (event.target as HTMLElement).closest<HTMLElement>('.spoiler');
	if (!spoiler) return;
	if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') return;
	event.preventDefault();
	spoiler.dataset.revealed = 'true';
	spoiler.setAttribute('aria-label', 'Spoiler, revealed');
}

// onerror handler that hides images whose source fails to load
export function hideBroken(event: Event) {
	(event.currentTarget as HTMLElement).hidden = true;
}

export function assetUrl(appId: string | undefined, asset: string | undefined): string | null {
	if (!asset) return null;
	if (asset.startsWith('mp:')) return 'https://media.discordapp.net/' + asset.slice(3);
	if (!appId) return null;
	return `https://cdn.discordapp.com/app-assets/${appId}/${asset}.png`;
}

export function emojiUrl(id: string, animated: boolean): string {
	return `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=32`;
}

export function intToHex(n: number): string {
	return '#' + (Number(n) >>> 0).toString(16).padStart(6, '0').slice(-6);
}

export function clamp(n: number, lo: number, hi: number): number {
	return Math.min(Math.max(n, lo), hi);
}

export function fmtDuration(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function fmtElapsed(start: number, now: number): string {
	const s = Math.max(0, Math.floor((now - start) / 1000));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	return h ? `${h}h ${m}m elapsed` : `${m}m elapsed`;
}

export function fmtMonthYear(iso: string | null): string {
	if (!iso) return '';
	const d = new Date(iso);
	return isNaN(d.getTime())
		? ''
		: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export function fmtClock(now: number, offsetMin: number): string {
	const local = new Date(now + offsetMin * 60_000);
	return `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
}

export function fmtUtcOffset(offsetMin: number): string {
	const sign = offsetMin >= 0 ? '+' : '-';
	const h = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
	const m = String(Math.abs(offsetMin) % 60).padStart(2, '0');
	return `UTC${sign}${h}:${m}`;
}

const CURRENCY: Record<string, string> = { gbp: '£', usd: '$', eur: '€', aud: 'A$', cad: 'C$' };

export function fmtPrice(p: WishlistItem['price']): string | null {
	if (!p || typeof p.amount !== 'number') return null;
	const exp = p.exponent ?? 2;
	const v = (p.amount / 10 ** exp).toFixed(exp);
	const sym = CURRENCY[p.currency.toLowerCase()];
	return sym ? sym + v : `${v} ${p.currency.toUpperCase()}`;
}

export const STATUS_LABEL: Record<Status | 'streaming', string> = {
	online: 'Online',
	idle: 'Idle',
	dnd: 'Do Not Disturb',
	offline: 'Offline',
	streaming: 'Streaming'
};

export const NITRO_LABEL: Record<string, string> = {
	nitro: 'Nitro',
	classic: 'Nitro Classic',
	basic: 'Nitro Basic'
};

export const WISHLIST_TYPE: Record<string, string> = {
	avatar_decoration: 'Decoration',
	profile_effect: 'Effect',
	nameplate: 'Nameplate',
	bundle: 'Bundle',
	variants_group: 'Variants',
	external_sku: 'Item'
};

export const CONNECTION_URLS: Record<string, (name: string, id: string) => string> = {
	tiktok: (n) => 'https://tiktok.com/@' + n,
	ebay: (n) => 'https://www.ebay.com/usr/' + n,
	instagram: (n) => 'https://instagram.com/' + n,
	xbox: (n) => 'https://www.xbox.com/en-GB/play/user/' + n,
	github: (n) => 'https://github.com/' + n,
	roblox: (_, id) => 'https://www.roblox.com/users/' + id + '/profile',
	epicgames: (_, id) => 'https://store.epicgames.com/u/' + id,
	twitter: (n) => 'https://twitter.com/' + n,
	twitch: (n) => 'https://twitch.tv/' + n,
	youtube: (_, id) => 'https://youtube.com/channel/' + id,
	spotify: (_, id) => 'https://open.spotify.com/user/' + id,
	steam: (_, id) => 'https://steamcommunity.com/profiles/' + id,
	reddit: (n) => 'https://reddit.com/user/' + n,
	domain: (n) => 'https://' + n,
	bluesky: (n) => 'https://bsky.app/profile/' + n
};

// ---- Discord markdown -----------------------------------------------------
// Renders a bio to an HTML string. All text is escaped; only https links and
// Discord CDN emoji are emitted, so the output is safe for {@html}.

function esc(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const URL_RE = /^https?:\/\/[^\s<>()[\]]+/i;
const EMOJI_RE = /^<(a)?:(\w+):(\d+)>/;
const MASKED_RE = /^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/;

const DELIMS: { open: string; wrap: [string, string] }[] = [
	{ open: '***', wrap: ['<strong><em>', '</em></strong>'] },
	{ open: '___', wrap: ['<u><em>', '</em></u>'] },
	{ open: '**', wrap: ['<strong>', '</strong>'] },
	{ open: '__', wrap: ['<u>', '</u>'] },
	{ open: '~~', wrap: ['<s>', '</s>'] },
	{
		open: '||',
		wrap: [
			"<span class='spoiler' role='button' tabindex='0' aria-label='Spoiler, click to reveal'>",
			'</span>'
		]
	},
	{ open: '*', wrap: ['<em>', '</em>'] },
	{ open: '_', wrap: ['<em>', '</em>'] }
];

const isWordChar = (c: string | undefined) => !!c && /\w/.test(c);

const link = (href: string, body: string) =>
	`<a href='${esc(href)}' target='_blank' rel='noopener noreferrer'>${body}</a>`;

function inline(text: string): string {
	let out = '';
	let i = 0;

	while (i < text.length) {
		const c = text[i];
		const rest = text.slice(i);

		if (c === '\\' && i + 1 < text.length && /[^a-zA-Z0-9\s]/.test(text[i + 1])) {
			out += esc(text[i + 1]);
			i += 2;
			continue;
		}

		if (c === '`') {
			const close = text.indexOf('`', i + 1);
			if (close !== -1) {
				out += `<code>${esc(text.slice(i + 1, close))}</code>`;
				i = close + 1;
				continue;
			}
		}

		const emoji = c === '<' && EMOJI_RE.exec(rest);
		if (emoji) {
			const name = esc(`:${emoji[2]}:`);
			out += `<img class='bio-emoji' src='${emojiUrl(emoji[3], emoji[1] === 'a')}' alt='${name}' title='${name}' loading='lazy' />`;
			i += emoji[0].length;
			continue;
		}

		const masked = c === '[' && MASKED_RE.exec(rest);
		if (masked) {
			out += link(masked[2], inline(masked[1]));
			i += masked[0].length;
			continue;
		}

		const url = (c === 'h' || c === 'H') && URL_RE.exec(rest);
		if (url) {
			const raw = url[0].replace(/[.,;:!?]+$/, '');
			out += link(raw, esc(raw));
			i += raw.length;
			continue;
		}

		let matched = false;
		for (const d of DELIMS) {
			if (!text.startsWith(d.open, i)) continue;
			const underscore = d.open === '_' || d.open === '___';
			if (underscore && isWordChar(text[i - 1])) continue;
			const close = text.indexOf(d.open, i + d.open.length);
			if (close === -1) continue;
			const body = text.slice(i + d.open.length, close);
			if (!body) continue;
			if (underscore && isWordChar(text[close + d.open.length])) continue;
			out += d.wrap[0] + inline(body) + d.wrap[1];
			i = close + d.open.length;
			matched = true;
			break;
		}
		if (matched) continue;

		out += esc(c);
		i++;
	}

	return out;
}

export function renderMarkdown(raw: string): string {
	const text = raw.replace(/\r\n/g, '\n');
	const out: string[] = [];
	let quoteAll = false;

	for (const seg of text.split(/(```[\s\S]*?```)/g)) {
		if (!seg) continue;
		if (seg.startsWith('```') && seg.endsWith('```') && seg.length > 5) {
			const body = seg
				.slice(3, -3)
				.replace(/^[a-zA-Z0-9+#-]*\n/, '')
				.replace(/\n$/, '');
			out.push(`<pre><code>${esc(body)}</code></pre>`);
			continue;
		}

		const lines = seg.split('\n');
		lines.forEach((line, li) => {
			const triple = /^>>>\s(.*)$/.exec(line);
			const quote = /^>\s(.*)$/.exec(line);
			const heading = /^(#{1,3})\s+(.+)$/.exec(line);
			const subtext = /^-#\s+(.+)$/.exec(line);
			const bullet = /^[-*]\s+(.+)$/.exec(line);

			if (triple) {
				quoteAll = true;
				out.push(`<blockquote>${inline(triple[1])}</blockquote>`);
			} else if (quoteAll) {
				out.push(`<blockquote>${inline(line)}</blockquote>`);
			} else if (quote) {
				out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
			} else if (heading) {
				const h = `h${heading[1].length + 2}`;
				out.push(`<${h}>${inline(heading[2])}</${h}>`);
			} else if (subtext) {
				out.push(`<small>${inline(subtext[1])}</small>`);
			} else if (bullet) {
				out.push(`<span class='bio-bullet'>${inline(bullet[1])}</span>`);
			} else {
				out.push(inline(line));
			}
			if (li < lines.length - 1) out.push('<br />');
		});
	}

	return out.join('');
}
