<!-- src/routes/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/index.css';
	import '#lib/styles/presence.css';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import ListeningIcon from '#lib/components/ListeningIcon.svelte';
	import LyricWords from '#lib/components/LyricWords.svelte';
	import SelfieDust from '#lib/components/SelfieDust.svelte';
	import { STATUS_LABEL, clamp, subscribePresence, type Presence } from '#lib/scripts/discord.ts';
	import {
		fetchLyrics,
		fetchRecent,
		timeAgo,
		trackFromPresence,
		trackKey,
		type Lyrics,
		type Scrobble
	} from '#lib/scripts/music.ts';
	import {
		fetchDevice,
		fetchFronters,
		memberName,
		type Device,
		type Member
	} from '#lib/scripts/plural.ts';

	import { discordId } from '#lib';

	const PHONE = 'pixel';

	let presence = $state<Presence | null>(null);
	let lastPlayed = $state<Scrobble | null>(null);
	let now = $state(Date.now());
	let lyrics = $state<Lyrics | null>(null);
	let fronters = $state<Member[]>([]);
	let phone = $state<Device | null>(null);

	let reduceMotion = $state(false);
	// Hover, keyboard focus or a tap on phones swaps to the real selfie
	let revealed = $state(false);
	let lyricsRequest = 0;

	$effect(() => {
		reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

		fetchRecent(1)
			.then(([last]) => (lastPlayed = last ?? null))
			.catch(() => {
				// The strip just leaves the music part out
			});
		// Fronting and phone pills are left out if these fail
		const loadFronters = () =>
			fetchFronters()
				.then((m) => (fronters = m))
				.catch(() => {});
		const loadPhone = () =>
			fetchDevice(PHONE)
				.then((d) => (phone = d))
				.catch(() => {});
		loadFronters();
		loadPhone();

		// The socket only says something changed, so refetch rather than
		// relying on the shape of each update
		const unsubscribe = subscribePresence(
			[discordId],
			(p) => (presence = p),
			(type) => {
				if (type === 'fronters_update' || type === 'reconnect') loadFronters();
				if (type === 'device_update' || type === 'reconnect') loadPhone();
			}
		);
		const tick = setInterval(() => (now = Date.now()), 60_000);
		return () => {
			unsubscribe();
			clearInterval(tick);
		};
	});

	const live = $derived(trackFromPresence(presence));
	const status = $derived(presence ? (presence.streaming ? 'streaming' : presence.status) : null);
	const key = $derived(trackKey(live));

	// Only reload lyrics when the song itself changes, not on every presence update
	$effect(() => {
		const request = ++lyricsRequest;
		const current = untrack(() => live);
		lyrics = null;
		if (!key || !current) return;
		fetchLyrics(current).then((l) => {
			if (request === lyricsRequest) lyrics = l;
		});
	});

	const synced = $derived(lyrics?.kind === 'synced' && live?.start && live.end ? lyrics : null);

	// Tick fast only while there's a line to follow, faster still for word-by-word lyrics
	$effect(() => {
		if (!synced) return;
		const ms = synced.lines.some((l) => l.words) ? 100 : 250;
		const tick = setInterval(() => (now = Date.now()), ms);
		return () => clearInterval(tick);
	});

	const position = $derived(live?.start ? clamp(now - live.start, 0, live.duration) : 0);

	const activeLine = $derived.by(() => {
		if (!synced || !live?.start) return -1;
		const at = position;
		return synced.lines.findLastIndex((line) => line.t <= at);
	});

	const line = $derived(synced && activeLine >= 0 ? synced.lines[activeLine] : null);
	const lineText = $derived(line?.text ?? '');
	const flyMs = $derived(reduceMotion ? 0 : 450);

	const batteryIcon = $derived.by(() => {
		const level = phone?.level;
		if (phone?.charging) return 'battery-charging';
		if (level == null) return 'battery-empty';
		if (level >= 80) return 'battery-full';
		if (level >= 35) return 'battery-2bars';
		return 'battery-empty-1';
	});
</script>

<Meta
	title="Clove Twilight"
	description="Clove Twilight, an AI-neutral software developer and music enthusiast. Projects, languages, live Discord presence and more."
/>

<svelte:head>
	<link rel="preconnect" href="https://lyrics.doughmination.gay" crossorigin="" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Doughmination</p>
		<h1>Clove Twilight</h1>
		<p class="subtitle">AI-Neutral Software Developer ▪ Music Enthusiast</p>
		<div class="intro">
			<p class="lede">
				I&apos;ve been programming for nine years, starting out writing Discord bots in JavaScript
				as a side project, and have since worked with various <a href="/stack"
					>languages and frameworks</a
				>.
				<br />
				These are primarily Python and TypeScript, but I&apos;ve expanded into
				<a href="/languages">more languages</a> than I thought I would.
				<br />
				More <a href="/about">about me</a>, and <a href="/ai">where I stand on AI</a>.
				<br />
				Looking for the old site? It&apos;s still up at
				<a href="https://v1.doughmination.gay">v1.doughmination.gay</a>.
			</p>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<figure
				class="selfie-box"
				class:revealed
				onpointerenter={(e) => e.pointerType !== 'touch' && (revealed = true)}
				onpointerleave={(e) => e.pointerType !== 'touch' && (revealed = false)}
				onpointerup={(e) => e.pointerType === 'touch' && (revealed = !revealed)}
				onfocusin={() => (revealed = true)}
				onfocusout={() => (revealed = false)}
			>
				<div class="selfie-photo">
					<SelfieDust
						{revealed}
						from={{
							src: '/avatar.avif',
							alt: 'Selfie of Clove',
							width: 400,
							height: 400
						}}
						to={{ src: '/avatar.avif', alt: '', width: 400, height: 400 }}
					/>

					{#if status}
						<a
							class="selfie-status"
							href="/discord"
							data-status={status}
							title="{STATUS_LABEL[status]} on Discord"
							aria-label="{STATUS_LABEL[status]} on Discord"
						></a>
					{/if}
				</div>

				<figcaption>
					<span class="selfie-caption">Pixel art ♡</span>
					<span class="selfie-caption selfie-caption-hover" aria-hidden="true"
						>My fave selfie ♡</span
					>
				</figcaption>
			</figure>
		</div>
		<p class="now">
			{#if live?.source}
				<a class="now-item" href="/music">
					<ListeningIcon source={live.source} />
					<span
						>Listening to <strong>{live.song}</strong>{#if live.artist}&nbsp;— {live.artist}{/if}</span
					>
				</a>
			{:else if lastPlayed}
				<a class="now-item" href="/music">
					<span class="now-icon" aria-hidden="true"
						><iconsax-icon name="music" type="bulk" size="24"></iconsax-icon></span
					>
					<span>
						Last played <strong>{lastPlayed.name}</strong>{#if lastPlayed.artist}&nbsp;— {lastPlayed.artist}{/if}
						{#if lastPlayed.uts}<span class="now-muted">· {timeAgo(lastPlayed.uts, now)}</span>{/if}
					</span>
				</a>
			{/if}
			{#if fronters.length}
				<span class="now-item" title="Currently fronting">
					<span class="now-icon" aria-hidden="true"
						><iconsax-icon name="profile-2user" type="bulk" size="24"></iconsax-icon></span
					>
					<span class="now-row">
						Fronting
						{#each fronters as member, i (member.id)}
							<span class="now-member" style:--member={member.color ? '#' + member.color : null}>
								{#if member.avatar_url}<img
										class="now-avatar"
										src={member.avatar_url.replace(/([?&]size=)\d+/, '$164')}
										alt=""
										width="20"
										height="20"
										loading="lazy"
									/>{/if}<strong>{memberName(member)}</strong>{#if member.pronouns}<span
										class="now-muted">({member.pronouns})</span
									>{/if}{#if i < fronters.length - 1},{/if}
							</span>
						{/each}
					</span>
				</span>
			{/if}
			{#if phone}
				<span
					class="now-item"
					title="Phone, updated {timeAgo(Math.floor(Date.parse(phone.updated_at) / 1000), now)}"
				>
					<span class="now-icon" aria-hidden="true"
						><iconsax-icon name="mobile" type="bulk" size="24"></iconsax-icon></span
					>
					<span class="now-row">
						Phone
						{#if phone.level != null}
							<strong
								class="now-battery"
								class:now-battery-low={phone.level < 20 && !phone.charging}
							>
								<span class="now-icon" aria-hidden="true"
									><iconsax-icon name={batteryIcon} type="bulk" size="24"></iconsax-icon></span
								>{phone.level}%
							</strong>
						{/if}
						{#if phone.charging}<span class="now-muted">· charging</span>{/if}
						{#if phone.lowPowerMode}<span class="now-muted">· power saving</span>{/if}
						{#if phone.wifi}<span class="now-muted">· on Wi-Fi</span>{/if}
					</span>
				</span>
			{/if}
			<a class="now-item" href="https://bwah.dev" target="_blank" rel="noopener">
				<span class="now-icon now-heart" aria-hidden="true"
					><iconsax-icon name="heart" type="bulk" size="24"></iconsax-icon></span
				>
				<span>In a relationship with <strong>Aria</strong></span>
			</a>
		</p>
		{#if synced}
			<a class="now-lyric" href="/music">
				<span class="now-lyric-label">
					<span class="now-icon" aria-hidden="true"
						><iconsax-icon name="music" type="bulk" size="24"></iconsax-icon></span
					>
					Lyrics
				</span>
				<span class="now-lyric-stage">
					{#key activeLine}
						<span
							class="now-lyric-line"
							class:now-lyric-gap={!lineText}
							in:fly={{ y: 14, duration: flyMs, delay: flyMs / 3 }}
							out:fly={{ y: -14, duration: flyMs }}
							>{#if line?.words}<LyricWords words={line.words} at={position} />{:else}{lineText ||
									'♪'}{/if}</span
						>
					{/key}
				</span>
			</a>
		{/if}
	</div>
</section>
