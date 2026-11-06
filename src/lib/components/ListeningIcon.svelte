<!-- src/lib/components/ListeningIcon.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import IcSportsEsports from '~icons/ic/outline-sports-esports';
	import SiSpotify from '~icons/simple-icons/spotify';

	// Decorative: the text next to it always names the app
	let { source }: { source: 'doughmination' | 'spotify' } = $props();
</script>

<span class="listening-icon" aria-hidden="true">
	{#if source === 'spotify'}
		<SiSpotify style="color: #1db954" />
	{:else}
		<IcSportsEsports />
	{/if}
</span>

<style>
	.listening-icon {
		display: inline-flex;
		flex: none;
		width: 1.3em;
		height: 1.3em;
	}

	.listening-icon :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
