<!-- src/lib/components/NowPlaying.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import IcClose from '~icons/ic/outline-close';
	import IcMusicNote from '~icons/ic/outline-music-note';
	import '#lib/styles/nowplaying.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import LyricWords from '#lib/components/LyricWords.svelte';
	import { STATUS_LABEL, clamp, subscribePresence, type Presence } from '#lib/scripts/discord.ts';
	import {
		artTint,
		fetchLyrics,
		trackFromPresence,
		trackKey,
		type Lyrics
	} from '#lib/scripts/music.ts';
	import { discordId } from '#lib';

	// The Discord page already shows the status in full
	const STATUS_HIDDEN_ON = ['/discord'];
	const COLLAPSED_KEY = 'dough:nowplaying:collapsed';
	const SPOTIFY_SEARCH = 'https://open.spotify.com/search/';

	let presence = $state<Presence | null>(null);
	let now = $state(Date.now());
	let lyrics = $state<Lyrics | null>(null);
	let tint = $state<string | null>(null);
	let reduceMotion = $state(false);
	// The visitor tucked it away; remembered between visits
	let collapsed = $state(false);

	let lyricsRequest = 0;
	let tintRequest = 0;

	// The socket is already open for the whole visit (hooks.client.ts)
	$effect(() => {
		reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		try {
			collapsed = localStorage.getItem(COLLAPSED_KEY) === '1';
		} catch {
			// Storage unavailable, so it just starts open
		}
		return subscribePresence([discordId], (p) => (presence = p));
	});

	function setCollapsed(value: boolean) {
		collapsed = value;
		try {
			if (value) localStorage.setItem(COLLAPSED_KEY, '1');
			else localStorage.removeItem(COLLAPSED_KEY);
		} catch {
			// Storage unavailable, so it only lasts for this visit
		}
	}

	const track = $derived(trackFromPresence(presence));
	const status = $derived(presence ? (presence.streaming ? 'streaming' : presence.status) : null);
	const customStatus = $derived(presence?.custom_status?.text ?? '');
	const key = $derived(trackKey(track));
	const art = $derived(track?.art ?? '');

	// Straight to the song when Spotify gave an id, otherwise a search for it
	const songUrl = $derived(
		track
			? track.url || SPOTIFY_SEARCH + encodeURIComponent(`${track.song} ${track.artist}`.trim())
			: ''
	);

	// Only reload lyrics when the song itself changes, not on every presence update.
	// Nothing is fetched while it's tucked away
	$effect(() => {
		const request = ++lyricsRequest;
		const current = untrack(() => track);
		lyrics = null;
		if (!key || !current || collapsed) return;
		fetchLyrics(current).then((found) => {
			if (request === lyricsRequest) lyrics = found;
		});
	});

	// Borrow a colour from the cover. The old tint stays until the new one is known
	$effect(() => {
		const request = ++tintRequest;
		if (!art) {
			tint = null;
			return;
		}
		artTint(art).then((found) => {
			if (request === tintRequest) tint = found;
		});
	});

	// Lyrics can only follow a song that says where it started and ends
	const synced = $derived(lyrics?.kind === 'synced' && track?.start && track.end ? lyrics : null);

	// Tick each second for the progress bar, faster while a lyric line is following
	$effect(() => {
		if (!track?.duration || collapsed) return;
		const wordSynced = synced?.lines.some((lyricLine) => lyricLine.words);
		const ms = wordSynced ? 100 : synced ? 250 : 1000;
		const tick = setInterval(() => (now = Date.now()), ms);
		return () => clearInterval(tick);
	});

	const position = $derived(track?.start ? clamp(now - track.start, 0, track.duration) : 0);
	const progress = $derived(track?.duration ? position / track.duration : 0);

	const activeLine = $derived(
		synced ? synced.lines.findLastIndex((lyricLine) => lyricLine.t <= position) : -1
	);
	const line = $derived(synced && activeLine >= 0 ? synced.lines[activeLine] : null);

	// Shown in the lyric's place, so the card keeps its size whatever the song has
	const lyricNote = $derived.by(() => {
		if (!lyrics) return 'Finding lyrics…';
		if (lyrics.kind === 'instrumental') return 'Instrumental';
		if (lyrics.kind === 'synced' || lyrics.kind === 'plain') return 'Lyrics are not synced';
		return 'No lyrics for this song';
	});

	const statusShown = $derived(status && !STATUS_HIDDEN_ON.includes(page.url.pathname));
	const flyIn = $derived({ y: -8, duration: reduceMotion ? 0 : 250 });
	const lyricMs = $derived(reduceMotion ? 0 : 350);
</script>

{#snippet hideButton()}
	<button
		class="pill-hide"
		type="button"
		title="Hide"
		aria-label="Hide what Clove is listening to"
		onclick={() => setCollapsed(true)}
	>
		<IcClose />
	</button>
{/snippet}

{#if collapsed}
	{#if track || statusShown}
		<button
			class="now-playing pill-collapsed"
			type="button"
			title={track ? 'Show what Clove is listening to' : 'Show Discord status'}
			aria-label={track ? 'Show what Clove is listening to' : 'Show Discord status'}
			style:--accent={tint}
			onclick={() => setCollapsed(false)}
			transition:fly={flyIn}
		>
			<IcMusicNote />
		</button>
	{/if}
{:else if track}
	<div class="now-playing pill-song" style:--accent={tint} transition:fly={flyIn}>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- always an external Spotify link -->
		<a
			class="pill-link"
			href={songUrl}
			target="_blank"
			rel="noopener external"
			title="{track.song}{track.artist ? ` by ${track.artist}` : ''}, open on Spotify"
		>
			<span class="pill-row">
				{#if track.art}
					<img class="pill-art" src={track.art} alt="" width="28" height="28" />
				{/if}
				<span class="pill-text">
					<strong>{track.song}</strong>{#if track.artist}<span class="pill-muted"
							>&nbsp;— {track.artist}</span
						>{/if}
				</span>
				<span class="pill-eq" aria-hidden="true"><i></i><i></i><i></i></span>
			</span>
			<!-- Lines share one grid cell so the old and new line can overlap while they fly -->
			<span class="pill-lyric">
				{#if synced}
					{#key activeLine}
						<span
							class="pill-lyric-line"
							class:pill-lyric-gap={!line?.text}
							in:fly={{ y: 10, duration: lyricMs, delay: lyricMs / 3 }}
							out:fly={{ y: -10, duration: lyricMs }}
							>{#if line?.words}<LyricWords words={line.words} at={position} />{:else}{line?.text ||
									'♪'}{/if}</span
						>
					{/key}
				{:else}
					<span class="pill-lyric-line pill-lyric-note">{lyricNote}</span>
				{/if}
			</span>
		</a>
		{@render hideButton()}
		{#if track.duration}
			<span class="pill-progress" style:--progress={progress} aria-hidden="true"></span>
		{/if}
	</div>
{:else if statusShown && status}
	<div class="now-playing" data-status={status} transition:fly={flyIn}>
		<a class="pill-link" href={resolve('/discord')} title="{STATUS_LABEL[status]} on Discord">
			<span class="pill-row">
				<span class="pill-dot" aria-hidden="true"></span>
				<span class="pill-text">
					{STATUS_LABEL[status]}{#if customStatus}<span class="pill-muted">
							· {customStatus}</span
						>{/if}
				</span>
			</span>
		</a>
		{@render hideButton()}
	</div>
{/if}
