<!-- src/lib/components/NowPlaying.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import '#lib/styles/nowplaying.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { STATUS_LABEL, clamp, subscribePresence, type Presence } from '#lib/scripts/discord.ts';
	import { trackFromPresence } from '#lib/scripts/music.ts';
	import { discordId } from '#lib';

	// These pages already show all of this in full
	const HIDDEN_ON = ['/', '/music', '/discord'];

	let presence = $state<Presence | null>(null);
	let now = $state(Date.now());
	let reduceMotion = $state(false);

	// The socket is already open for the whole visit (hooks.client.ts)
	$effect(() => {
		reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		return subscribePresence([discordId], (p) => (presence = p));
	});

	const track = $derived(trackFromPresence(presence));
	const status = $derived(presence ? (presence.streaming ? 'streaming' : presence.status) : null);
	const customStatus = $derived(presence?.custom_status?.text ?? '');

	// Only tick while there's a progress bar to move
	$effect(() => {
		if (!track?.duration) return;
		const tick = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(tick);
	});

	const progress = $derived(
		track?.start && track.duration ? clamp((now - track.start) / track.duration, 0, 1) : 0
	);
	const hidden = $derived(HIDDEN_ON.includes(page.url.pathname));
	const flyIn = $derived({ y: -8, duration: reduceMotion ? 0 : 250 });
</script>

{#if !hidden && track}
	<a
		class="now-playing"
		href={resolve('/music')}
		title="Listening to {track.song}{track.artist ? ` by ${track.artist}` : ''}"
		transition:fly={flyIn}
	>
		{#if track.art}
			<img class="np-art" src={track.art} alt="" width="28" height="28" />
		{/if}
		<span class="np-text">
			<strong>{track.song}</strong>{#if track.artist}<span class="np-muted"
					>&nbsp;— {track.artist}</span
				>{/if}
		</span>
		<span class="np-eq" aria-hidden="true"><i></i><i></i><i></i></span>
		{#if track.duration}
			<span class="np-progress" style:--progress={progress} aria-hidden="true"></span>
		{/if}
	</a>
{:else if !hidden && status}
	<a
		class="now-playing"
		href={resolve('/discord')}
		data-status={status}
		title="{STATUS_LABEL[status]} on Discord"
		transition:fly={flyIn}
	>
		<span class="np-dot" aria-hidden="true"></span>
		<span class="np-text">
			{STATUS_LABEL[status]}{#if customStatus}<span class="np-muted"> · {customStatus}</span>{/if}
		</span>
	</a>
{/if}
