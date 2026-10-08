<!-- src/routes/music/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/music.css';
	import { untrack } from 'svelte';
	import ListeningIcon from '#lib/components/ListeningIcon.svelte';
	import LyricWords from '#lib/components/LyricWords.svelte';
	import { subscribePresence, clamp, fmtDuration, hideBroken } from '#lib/scripts/discord.ts';
	import {
		artistImage,
		fetchLyrics,
		fetchRecent,
		fetchTopArtists,
		timeAgo,
		trackFromPresence,
		trackFromScrobble,
		trackKey,
		type Lyrics,
		type Scrobble,
		type TopArtist,
		type Track
	} from '#lib/scripts/music.ts';

	import { discordId } from '#lib';

	const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];

	let track = $state<Track | null>(null);
	let lyrics = $state<Lyrics>({ kind: 'note', text: 'Waiting for a track…' });
	let locked = $state(true);
	let recent = $state<Scrobble[] | null>(null);
	let recentError = $state(false);
	let top = $state<TopArtist[]>([]);
	let topArt = $state<Record<string, string>>({});
	let now = $state(Date.now());
	let lyricsBox = $state<HTMLDivElement>();

	let reduceMotion = false;
	let lyricsRequest = 0;

	async function showLastPlayed() {
		try {
			const [last] = await fetchRecent(1);
			// A live track may have arrived while this was loading
			if (last && !track?.live) track = trackFromScrobble(last);
		} catch {
			// Keep whatever is showing
		}
	}

	async function loadRecent() {
		try {
			recent = await fetchRecent(12);
			recentError = false;
		} catch {
			recentError = true;
		}
	}

	async function loadTop() {
		try {
			top = await fetchTopArtists(8);
			for (const a of top) {
				artistImage(a.name).then((url) => {
					if (url) topArt[a.name] = url;
				});
			}
		} catch {
			// Top artists are optional
		}
	}

	$effect(() => {
		reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		(async () => {
			await showLastPlayed();
			await loadRecent();
			await loadTop();
		})();
		const unsubscribe = subscribePresence([discordId], (p) => {
			const live = trackFromPresence(p);
			if (live) {
				track = live;
			} else if (!track || track.live) {
				track = null;
				showLastPlayed();
			}
		});
		const refresh = setInterval(loadRecent, 45_000);
		const tick = setInterval(() => (now = Date.now()), 250);
		return () => {
			unsubscribe();
			clearInterval(refresh);
			clearInterval(tick);
		};
	});

	const key = $derived(trackKey(track));

	// Only reload lyrics when the song itself changes, not on every presence update
	$effect(() => {
		const request = ++lyricsRequest;
		const current = untrack(() => track);
		locked = true;
		if (!key || !current) {
			lyrics = { kind: 'note', text: 'No track playing.' };
			return;
		}
		lyrics = { kind: 'loading' };
		fetchLyrics(current).then((l) => {
			if (request === lyricsRequest) lyrics = l;
		});
	});

	const position = $derived(
		track?.live && track.start && track.end ? clamp(now - track.start, 0, track.duration) : null
	);

	// Words move faster than lines, so tick faster while they're on screen
	const wordSynced = $derived(lyrics.kind === 'synced' && lyrics.lines.some((l) => l.words));
	$effect(() => {
		if (!wordSynced || !track?.live) return;
		const tick = setInterval(() => (now = Date.now()), 100);
		return () => clearInterval(tick);
	});

	const activeLine = $derived.by(() => {
		if (lyrics.kind !== 'synced' || position === null) return -1;
		const at = position;
		return lyrics.lines.findLastIndex((line) => line.t <= at);
	});

	$effect(() => {
		if (!locked || activeLine < 0 || !lyricsBox) return;
		const line = lyricsBox.children[activeLine] as HTMLElement | undefined;
		if (!line) return;
		lyricsBox.scrollTo({
			top: line.offsetTop - lyricsBox.clientHeight / 2 + line.clientHeight / 2,
			behavior: reduceMotion ? 'auto' : 'smooth'
		});
	});

	// Scrolling the lyrics yourself stops them following the song
	function unlock() {
		locked = false;
	}
</script>

<Meta
	title="Music"
	description="What Clove is listening to: live now-playing track, synced lyrics, and recent plays from Last.fm."
/>

<svelte:head>
	<link rel="preconnect" href="https://doughmination.uk" crossorigin="" />
	<link rel="preconnect" href="https://ws.audioscrobbler.com" crossorigin="" />
	<link rel="preconnect" href="https://lyrics.doughmination.gay" crossorigin="" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Clove Twilight</p>
		<h1>Music</h1>
		<p class="subtitle">What I&apos;m listening to, with lyrics that follow along</p>
	</div>
</section>

<section class="music wrap" class:live={track?.live}>
	<svelte:element
		this={track?.url ? 'a' : 'div'}
		class="mu-card"
		href={track?.url || undefined}
		target={track?.url ? '_blank' : undefined}
		rel={track?.url ? 'noopener' : undefined}
	>
		{#if track?.art}
			<img
				class="mu-art"
				src={track.art}
				alt=""
				referrerpolicy="no-referrer"
				onerror={hideBroken}
			/>
		{:else}
			<span class="mu-art mu-art-blank" aria-hidden="true"
				><iconsax-icon name="music" type="bulk" size="24"></iconsax-icon></span
			>
		{/if}
		<div class="mu-meta">
			<p class="mu-state">
				{#if track?.source}
					<ListeningIcon source={track.source} />
					{track.source === 'doughmination'
						? 'Listening on Doughmination Music'
						: 'Listening to Spotify'}
				{:else}
					{track ? 'Last played' : 'Not listening right now'}
				{/if}
			</p>
			<p class="mu-song">{track ? track.song || 'Unknown track' : '—'}</p>
			{#if track?.artist}<p class="mu-artist">{track.artist}</p>{/if}
			{#if track?.album}<p class="mu-album">{track.album}</p>{/if}
			{#if track && position !== null}
				<div class="mu-progress">
					<span class="mu-time">{fmtDuration(position)}</span>
					<div
						class="mu-bar"
						role="progressbar"
						aria-label="Track progress"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round((position / track.duration) * 100)}
					>
						<div class="mu-fill" style:width="{(position / track.duration) * 100}%"></div>
					</div>
					<span class="mu-time">{fmtDuration(track.duration)}</span>
				</div>
			{/if}
		</div>
	</svelte:element>

	<div class="mu-heading-row">
		<h2 class="mu-heading">Lyrics</h2>
		{#if lyrics.kind === 'synced'}
			<button
				class="mu-sync"
				class:on={locked}
				type="button"
				aria-pressed={locked}
				onclick={() => (locked = !locked)}
			>
				<span class="mu-eq" aria-hidden="true"
					><span></span><span></span><span></span><span></span></span
				>
				{locked ? 'Synced' : 'Sync'}
			</button>
		{/if}
	</div>
	<!-- A fresh box per song so it starts scrolled to the top -->
	{#key key}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
		<div
			class="mu-lyrics"
			data-kind={lyrics.kind}
			role="region"
			aria-label="Lyrics"
			tabindex="0"
			bind:this={lyricsBox}
			onwheel={unlock}
			ontouchmove={unlock}
			onkeydown={(e) => SCROLL_KEYS.includes(e.key) && unlock()}
		>
			{#if lyrics.kind === 'loading'}
				<p class="mu-note">Finding lyrics…</p>
			{:else if lyrics.kind === 'note'}
				<p class="mu-note">{lyrics.text}</p>
			{:else if lyrics.kind === 'instrumental'}
				<p class="mu-note">
					<iconsax-icon name="music" type="bulk" size="24" aria-hidden="true"
					></iconsax-icon>Instrumental<iconsax-icon
						name="music"
						type="bulk"
						size="24"
						aria-hidden="true"
					></iconsax-icon>
				</p>
			{:else if lyrics.kind === 'synced'}
				{#each lyrics.lines as line, i (i)}
					<p class="mu-line" class:active={i === activeLine}>
						{#if line.words && i === activeLine && position !== null}
							<LyricWords words={line.words} at={position} />
						{:else}
							{line.text || ' '}
						{/if}
					</p>
				{/each}
			{:else}
				{#each lyrics.lines as line, i (i)}
					<p class="mu-line">{line || ' '}</p>
				{/each}
			{/if}
		</div>
	{/key}

	<h2 class="mu-heading">Recently played</h2>
	{#if recent?.length}
		<ul class="mu-recent">
			{#each recent as r, i (i)}
				<li>
					<a
						class="mu-recent-item"
						class:playing={r.playing}
						href={r.url}
						target="_blank"
						rel="noopener"
					>
						{#if r.art}
							<img class="mu-recent-art" src={r.art} alt="" loading="lazy" />
						{:else}
							<span class="mu-recent-art mu-art-blank" aria-hidden="true"
								><iconsax-icon name="music" type="bulk" size="24"></iconsax-icon></span
							>
						{/if}
						<span class="mu-recent-text">
							<span class="mu-recent-name">{r.name}</span>
							<span class="mu-recent-artist">{r.artist}</span>
						</span>
						<span class="mu-recent-when">
							{r.playing ? 'Scrobbling now' : r.uts ? timeAgo(r.uts, now) : ''}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{:else if recentError}
		<p class="mu-empty">Couldn&apos;t reach Last.fm just now</p>
	{:else if recent}
		<p class="mu-empty">No recent scrobbles</p>
	{/if}

	{#if top.length}
		<h2 class="mu-heading">Top artists · last 7 days</h2>
		<ol class="mu-top">
			{#each top as a, i (a.name)}
				<li>
					<a class="mu-top-item" href={a.url} target="_blank" rel="noopener">
						<span class="mu-top-rank">{i + 1}</span>
						{#if topArt[a.name]}
							<img class="mu-top-art" src={topArt[a.name]} alt="" referrerpolicy="no-referrer" />
						{:else}
							<span class="mu-top-art mu-art-blank" aria-hidden="true"
								><iconsax-icon name="music" type="bulk" size="24"></iconsax-icon></span
							>
						{/if}
						<span class="mu-top-text">
							<span class="mu-top-name">{a.name}</span>
							<span class="mu-top-plays">
								{a.plays.toLocaleString('en-GB')}
								{a.plays === 1 ? 'play' : 'plays'}
							</span>
						</span>
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</section>
