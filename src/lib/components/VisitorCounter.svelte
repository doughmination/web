<!-- src/lib/components/VisitorCounter.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import { subscribeVisitors } from '#lib/scripts/visitors.ts';

	// Digit images live in static/counter as 0.png to 9.png: the 'rule34' theme
	// from Moe-Counter (https://github.com/journey-ad/Moe-Counter, MIT), turned
	// from GIFs into looping APNGs
	const DIGIT_SRC = (d: string) => `/counter/${d}.png`;
	// Old-school hit counters always show leading zeroes
	const MIN_DIGITS = 4;

	let count = $state<number | null>(null);

	$effect(() => subscribeVisitors((n) => (count = n)));

	const digits = $derived(count === null ? [] : [...String(count).padStart(MIN_DIGITS, '0')]);
	const label = $derived(
		count === 1 ? 'Just you here right now' : `${count} people here right now`
	);
</script>

{#if count !== null}
	<span class="visitors" title={label}>
		<span class="visitor-digits" role="img" aria-label={label}>
			{#each digits as digit, i (i)}
				<img src={DIGIT_SRC(digit)} alt="" width="45" height="100" />
			{/each}
		</span>
		<span class="visitor-label" aria-hidden="true">{count === 1 ? 'just you' : 'here now'}</span>
	</span>
{/if}
